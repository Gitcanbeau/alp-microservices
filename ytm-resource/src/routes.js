const Router = require('koa-router');
const IndexLibrary = require('./models/index_library');

const router = new Router();

router.get('/tracks', async (ctx) => {
  const tracks = await IndexLibrary.find({});
  ctx.body = tracks;
});

module.exports = router;
