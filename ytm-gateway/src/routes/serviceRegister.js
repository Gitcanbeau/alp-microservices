//首先，确保在 ytm-gateway 中创建一个新的 register.js 文件来处理微服务的注册请求：
const Router = require('koa-router');
const router = new Router();

const services = [];

// 注册服务的路由
router.post('/register-service', async (ctx) => {
  const serviceInfo = ctx.request.body;
  services.push(serviceInfo);
  ctx.status = 200;
  ctx.body = { message: 'Service registered successfully' };
});

module.exports = router;
