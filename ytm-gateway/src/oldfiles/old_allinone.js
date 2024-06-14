const Koa = require('koa');
const Router = require('@koa/router');
const jwt = require('jsonwebtoken');
const bodyParser = require('koa-bodyparser');

const app = new Koa();
const router = new Router();

const services = [];

const secretKey = process.env.JWT_SECRET;

// JWT 鉴权中间件
const jwtAuthMiddleware = async (ctx, next) => {
  const token = ctx.headers.authorization;
  if (!token) {
    ctx.status = 401;
    ctx.body = { error: 'Unauthorized: Token not provided' };
    return;
  }

  try {
    const decoded = jwt.verify(token, secretKey);
    ctx.state.user = decoded;
    await next();
  } catch (err) {
    ctx.status = 401;
    ctx.body = { error: 'Unauthorized: Invalid token' };
  }
};

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

app
  .use(bodyParser())
  .use(router.routes())
  .use(router.allowedMethods());

app.listen(3000, () => {
  console.log('API Gateway is running on port 3000');
});


// API Gateway 的主要功能包括：

// 鉴权：解析 JWT Token，获得用户 UID 和订阅等级，拦截无效的 Token。
// 路由：根据请求的来源，将消息和解析后的用户信息转发给对应的子服务。
// 响应：接收到来自子服务的数据后转发回给来源。
// 自动注册：暴露一个内部端口/API 接口，用于子服务的自动注册。
