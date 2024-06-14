require('dotenv').config();
const Router = require('koa-router');
const fetch = require('node-fetch');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const jwtAuth = require('../middlewares/jwtAuth');


const router = new Router();

const secretKey = process.env.JWT_SECRET;

// 注册新用户
router.post('/register', async (ctx) => {
    const { username, password } = ctx.request.body;

    console.log('Received request to register user:', { username, password });

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        console.log('Plain password:', password);
        console.log('Hashed password during registration:', hashedPassword); // 添加日志

        //从你提供的日志中可以看到，ytm-resource 和 ytm-gateway 在处理密码哈希时存在问题。
        //特别是 ytm-resource 在接收到的哈希密码和存储到数据库中的哈希密码不一致。
        // 可能的原因：
        // 多次哈希处理：看起来 ytm-resource 在接收到已经哈希过的密码时，又对其进行了哈希处理。

        //ytm-gateway/src/routes/auth.js
        // 确保注册时只对密码进行一次哈希处理。
        //ytm-resource/src/routes/users.js
        //确保接收到的哈希密码不会再次进行哈希处理。


        const response = await fetch('http://localhost:35706/users', {
            //'http://ytm-resource:35706/users'
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password: hashedPassword }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Failed to register user in ytm-gateway:', errorText);
            throw new Error('Failed to register user');
        }

        const user = await response.json();
        const token = jwt.sign({ id: user._id, username: user.name }, secretKey);
        ctx.body = { token };
    } catch (error) {
        console.error('Error during user registration in ytm-gateway:', error);
        ctx.status = 500;
        ctx.body = { error: 'Internal Server Error' };
    }
});

// 用户登录
router.post('/login', async (ctx) => {
    const { username, password } = ctx.request.body;

    try {
        const response = await fetch(`http://localhost:35706/users/${username}`);
        //'http://ytm-resource:35706/users/${username}'
        const user = await response.json();
        console.log('Fetched user from ytm-resource:', user); // 添加日志

        // 确认 password 的类型
        console.log('Password type:', typeof password);
        console.log('User password type:', typeof user.password);

        // 输出密码和哈希值
        console.log('Plain password:', password);
        console.log('password from db:', user.password);

        const isMatch = await bcrypt.compare(password, user.password);
        console.log('Password comparison result:', isMatch); // 添加日志

        if (!user || !isMatch) {
            ctx.status = 401;
            ctx.body = { error: 'Invalid username or password' };
            return;
        }

        // const token = jwt.sign({ id: user._id, username: user.username }, secretKey);
        const token = jwt.sign({ id: user.uid, username: user.name, subscribe: user.subscribe }, secretKey);
        console.log('Generated JWT:', token); // 输出生成的 JWT
        ctx.body = { token };//postman里能看见token
    } catch (error) {
        console.error('Error during user login in ytm-gateway:', error);
        ctx.status = 500;
        ctx.body = { error: 'Internal Server Error' };
    }
});

// 注册服务的路由---单独放在一个路由serviceRegister
// const services = [];
// router.post('/register-service', async (ctx) => {
//   const serviceInfo = ctx.request.body;
//   services.push(serviceInfo);
//   ctx.status = 200;
//   ctx.body = { message: 'Service registered successfully' };
// });

router.use(jwtAuth); // 保护需要认证的路由

module.exports = router;

