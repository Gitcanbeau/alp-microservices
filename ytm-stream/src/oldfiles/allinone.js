const Koa = require('koa');
const Router = require('@koa/router');
const fs = require('fs');
const jwt = require('jsonwebtoken');

const app = new Koa();
const router = new Router();

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

// 音频流处理
router.get('/stream/:trackId', jwtAuthMiddleware, async (ctx) => {
  const { trackId } = ctx.params;
  const user = ctx.state.user;

  // 检查用户订阅等级
  if (user.subscribeLevel !== 'premium') {
    ctx.status = 403;
    ctx.body = { error: 'Forbidden: Premium subscription required' };
    return;
  }

  const filePath = `/path/to/your/audio/files/${trackId}.mp3`;
  if (fs.existsSync(filePath)) {
    ctx.set('Content-Type', 'audio/mpeg');
    ctx.body = fs.createReadStream(filePath);
  } else {
    ctx.status = 404;
    ctx.body = { error: 'Not Found: Track does not exist' };
  }
});

// Stream Service 自动注册
const registerService = async () => {
  const serviceInfo = {
    name: 'ytm-stream',
    port: 35707,
    auth: true,
    type: 'rest',
    listen: [
      { name: 'stream', method: ['get'] },
    ],
  };

  await fetch('http://localhost:3000/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(serviceInfo),
  });
};

app
  .use(router.routes())
  .use(router.allowedMethods());

app.listen(35707, () => {
  console.log('Stream Service is running on port 35707');
  registerService();
});

// Stream Service 负责向客户端返回音频文件的 streamBuffer，并处理用户的订阅等级。