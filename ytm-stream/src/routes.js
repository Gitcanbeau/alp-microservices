const Router = require('koa-router');
const fs = require('fs');
const path = require('path');
const jwtAuthMiddleware = require('./middlewares/jwtAuth');

const router = new Router();


//你用一个用户从Gateway去login，通过resource验证以后如果该用户能通过，会产生一个token
  //你用这个token去访问stream api的时候相当于这个用户登陆以后去访问
  //这个token里面有个payload里面是需要验证的信息，一般来说就是用户名密码，但是这个是一个很好的例子，token里面还需要带上subscribe 字段。
  //这里的情况：const token = jwt.sign({ id: user.uid, username: user.name, subscribe: user.subscribe }, secretKey);
  //普通的情况：const token = jwt.sign({ id: user.uid, username: user.name }, secretKey);
  //确保生成 JWT 的时候，用户信息中包含了 subscribe 字段。
router.get('/stream/:trackId', jwtAuthMiddleware, async (ctx) => {
  
  const { trackId } = ctx.params;
  const user = ctx.state.user;
  console.log('User info from JWT:', user); // 输出用户信息

  if (user.subscribe !== 'Premium') {
    ctx.status = 403;
    ctx.body = { error: 'Forbidden: Premium subscription required' };
    return;
  }

  const filePath = path.join(__dirname, 'audio', `${trackId}.mp3`);
  if (fs.existsSync(filePath)) {
    ctx.set('Content-Type', 'audio/mpeg');
    ctx.body = fs.createReadStream(filePath);
  } else {
    ctx.status = 404;
    ctx.body = { error: 'Not Found: Track does not exist' };
  }
});

module.exports = router;


