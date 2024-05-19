const Router = require('koa-router');
const fs = require('fs');
const jwtAuthMiddleware = require('./middlewares/jwtAuth');

const router = new Router();

router.get('/stream/:trackId', jwtAuthMiddleware, async (ctx) => {
  const { trackId } = ctx.params;
  const user = ctx.state.user;

  if (user.subscribeLevel !== 'premium') {
    ctx.status = 403;
    ctx.body = { error: 'Forbidden: Premium subscription required' };
    return;
  }

  const filePath = `/audio/${trackId}.mp3`;
  if (fs.existsSync(filePath)) {
    ctx.set('Content-Type', 'audio/mpeg');
    ctx.body = fs.createReadStream(filePath);
  } else {
    ctx.status = 404;
    ctx.body = { error: 'Not Found: Track does not exist' };
  }
});

module.exports = router;
