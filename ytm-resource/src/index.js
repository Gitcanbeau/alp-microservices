const Koa = require('koa');
const bodyParser = require('koa-bodyparser');
const router = require('./routes');
// const router = require('./apiRoutes');// 直接引入 apiRoutes.js 也是可以的


// 是否有必要保留 routes.js ？
// 保留 routes.js:
// 保留 routes.js 文件有助于将所有路由配置集中到一个文件中，使 index.js 文件更加简洁。
// 如果将来有更多的路由或中间件需要添加，可以在 routes.js 中进行统一管理。

// 移除 routes.js 并直接使用 apiRoutes.js:
// 如果项目简单且没有太多路由配置需求，可以直接在 index.js 中使用 apiRoutes.js，减少文件层次。
// 建议
// 为了保持代码清晰和可维护性，我建议保留 routes.js 文件。这样可以将所有路由配置集中管理，避免在 index.js 文件中出现过多的路由配置细节。

const app = new Koa();

// 连接 MongoDB
mongoose.connect('mongodb://localhost/library', { useNewUrlParser: true, useUnifiedTopology: true });

// Resource Service 自动注册
const registerService = async () => {
  const serviceInfo = {
    name: 'ytm-resource',
    port: 35706,
    auth: true,
    type: 'rest',
    listen: [
      { name: 'album', method: ['get', 'post', 'put', 'delete'] },
      { name: 'track', method: ['get', 'post', 'put', 'delete'] },
      { name: 'playlist', method: ['get', 'post', 'put', 'delete'] },
    ],
  };

  await fetch('http://localhost:3000/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(serviceInfo),
  });
};

app
  .use(bodyParser())
  .use(router.routes())
  .use(router.allowedMethods());

const PORT = process.env.PORT || 35706;
app.listen(PORT, () => {
  console.log(`Resource Service is running on port ${PORT}`);
  registerService();
});
