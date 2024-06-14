// middlewares/jwtAuth.js
const jwt = require('jsonwebtoken');
require('dotenv').config(); // 再次确保加载环境变量
const secretKey = process.env.JWT_SECRET;

console.log('Loaded JWT secret key:', secretKey);


const jwtAuthMiddleware = async (ctx, next) => {

  const authHeader = ctx.headers.authorization;
  if (!authHeader) {
      ctx.status = 401;
      ctx.body = { error: 'Unauthorized: Token not provided' };
      return;
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
      ctx.status = 401;
      ctx.body = { error: 'Unauthorized: Token not provided' };
      return;
  }

  try {
    const decoded = jwt.verify(token, secretKey);
    console.log('Decoded JWT:', decoded); // 输出解码后的 JWT
    ctx.state.user = decoded;
    await next();
  } catch (err) {
    console.error('Error during JWT verification:', err); // 输出 JWT 验证错误
    ctx.status = 401;
    ctx.body = { error: 'Unauthorized: Invalid token' };
  }
};

module.exports = jwtAuthMiddleware;
