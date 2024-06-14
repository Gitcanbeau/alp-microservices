// src/routes/users.js
const Router = require('koa-router');
const bcrypt = require('bcryptjs');

const User = require('../models/user');
const mongoose = require('mongoose'); // 确保引入 mongoose

const router = new Router();

//gateway中传来的用户register请求
router.post('/users', async (ctx) => {
    const { username, password } = ctx.request.body;

    console.log('Received request to register user:', { username, password });

    if (!username || !password) {
        ctx.status = 400;
        ctx.body = { error: 'Username and password are required' };
        return;
    }

    try {
        const existingUser = await User.findOne({ name: username });
        if (existingUser) {
            ctx.status = 400;
            ctx.body = { error: 'User already exists' };
            return;
        }

        // const hashedPassword = await bcrypt.hash(password, 10);
        console.log('Hashed password from gateway:', password); // 添加日c
        
         // 不要再次哈希密码
         //从你提供的日志中可以看到，ytm-resource 和 ytm-gateway 在处理密码哈希时存在问题。
        //特别是 ytm-resource 在接收到的哈希密码和存储到数据库中的哈希密码不一致。
        // 可能的原因：
        // 多次哈希处理：看起来 ytm-resource 在接收到已经哈希过的密码时，又对其进行了哈希处理。

        //ytm-gateway/src/routes/auth.js
        // 确保注册时只对密码进行一次哈希处理。
        //ytm-resource/src/routes/users.js
        //确保接收到的哈希密码不会再次进行哈希处理。
        //虽然从gateway传递过来的密码没有进行第二次hash，
        //但是newuser.save的时候使用的是user模型，里面有一个pre-save hook会再进行一次hash。
        //所以应该修改user模型里的pre-save hook
        const newUser = new User({ 
            uid: new mongoose.Types.ObjectId(), 
            name: username, 
            password: password, // 直接存储传递过来的哈希密码
            subscribe: 'Premium'
        });

        await newUser.save();

        console.log('User registered successfully:', newUser);

        ctx.status = 201;
        ctx.body = newUser;
    } catch (error) {
        console.error('Error during user registration in ytm-resource:', error);
        ctx.status = 500;
        ctx.body = { error: 'Internal Server Error' };
    }
});

//gateway中传来的用户login请求
router.get('/users/:username', async (ctx) => {
    try {
      const user = await User.findOne({ name: ctx.params.username });
      if (!user) {
        ctx.status = 404;
        ctx.body = { error: 'User not found' };
        return;
      }
      ctx.body = user;
    } catch (error) {
      ctx.status = 500;
      ctx.body = { error: 'Internal Server Error' };
    }
  });
  

module.exports = router;
