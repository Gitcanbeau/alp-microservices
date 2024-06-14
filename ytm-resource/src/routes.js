const Router = require('koa-router');
const apiRoutes = require('./apiRoutes');

// 检查和分析
// apiRoutes.js: 这个文件定义了具体的API路由，直接处理HTTP请求。
// routes.js: 这个文件简单地引入了 apiRoutes 并将其挂载到一个新的 Router 实例上。
// 从结构上看，routes.js 只是对 apiRoutes.js 的封装，将 apiRoutes 中的路由整合到一起，形成一个单一的路由入口。

const router = new Router();

router.use(apiRoutes.routes());
router.use(apiRoutes.allowedMethods());

module.exports = router;

