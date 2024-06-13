const Router = require('koa-router');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { addUser, findUser } = require('./users');

const router = new Router();
const secretKey = 'your-secret-key'; // 请使用更安全的密钥，并将其存储在环境变量中

// 注册新用户
router.post('/register', async (ctx) => {
    const { username, password } = ctx.request.body;
    if (!username || !password) {
        ctx.status = 400;
        ctx.body = { message: 'Username and password are required' };
        return;
    }

    const existingUser = await findUser(username);
    if (existingUser) {
        ctx.status = 400;
        ctx.body = { message: 'User already exists' };
        return;
    }

    const user = await addUser(username, password);
    ctx.status = 201;
    ctx.body = { message: 'User created', user: { username: user.username } };
});

// 用户登录
router.post('/login', async (ctx) => {
    const { username, password } = ctx.request.body;
    if (!username || !password) {
        ctx.status = 400;
        ctx.body = { message: 'Username and password are required' };
        return;
    }

    const user = await findUser(username);
    if (!user) {
        ctx.status = 400;
        ctx.body = { message: 'Invalid username or password' };
        return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        ctx.status = 400;
        ctx.body = { message: 'Invalid username or password' };
        return;
    }

    const token = jwt.sign({ username: user.username }, secretKey, { expiresIn: '1h' });
    ctx.body = { message: 'Login successful', token };
});

module.exports = router;
