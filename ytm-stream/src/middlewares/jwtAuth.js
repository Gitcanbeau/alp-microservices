const jwt = require('jsonwebtoken');
const secretKey = process.env.JWT_SECRET;

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

module.exports = jwtAuthMiddleware;
