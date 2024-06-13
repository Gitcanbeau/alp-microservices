const Router = require('@koa/router');
const jwtAuthMiddleware = require('./middlewares/jwtAuth');
const http = require('http');

const router = new Router();
const services = [];
const secretKey = process.env.JWT_SECRET;

// 自动注册 API
router.post('/register', async (ctx) => {
  const service = ctx.request.body;
  services.push(service);
  ctx.status = 201;
  ctx.body = { message: 'Service registered successfully' };
});

// 路由转发中间件
const routeRequest = async (ctx, next) => {
  const service = services.find(s => ctx.path.startsWith(`/${s.name}`));
  if (!service) {
    ctx.status = 404;
    ctx.body = { error: 'Not Found: Service not registered' };
    return;
  }

  if (service.auth) {
    // JWT 鉴权中间件
    await jwtAuthMiddleware(ctx, next);
  }

  // 使用 http-proxy 或其他方式将请求转发到对应的子服务
  const options = {
    hostname: 'localhost',
    port: service.port,
    path: ctx.path.replace(`/${service.name}`, ''),
    method: ctx.method,
    headers: ctx.headers,
  };

  // 使用 HTTP 库转发请求（例如：http.request）
  const req = http.request(options, res => {
    ctx.status = res.statusCode;
    ctx.set(res.headers);
    res.pipe(ctx.res);
  });

  if (ctx.request.body) {
    req.write(JSON.stringify(ctx.request.body));
  }

  req.end();
};

router.all('/api/*', routeRequest);

module.exports = router;
