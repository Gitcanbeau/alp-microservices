const Router = require('koa-router');
const { libraryLoad } = require('./services');

const router = new Router();

router.post('/metadata/load', async (ctx) => {
  const { path } = ctx.request.body;
  try {
    await libraryLoad(path);
    ctx.status = 200;
    ctx.body = { message: 'Library loaded successfully' };
  } catch (error) {
    ctx.status = 500;
    ctx.body = { error: 'Failed to load library' };
  }
});

module.exports = router;
