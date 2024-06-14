// handlers/authHandler.js
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/user');

const secretKey = process.env.JWT_SECRET;

// 登录
const loginUser = async (ctx) => {
    const { username, password } = ctx.request.body;

    try {
        const user = await User.findOne({ name: username });

        if (!user || !await bcrypt.compare(password, user.password)) {
            ctx.status = 401;
            ctx.body = { error: 'Invalid username or password' };
            return;
        }

        const token = jwt.sign({ id: user.uid, username: user.name }, secretKey);
        ctx.body = { token };
    } catch (error) {
        ctx.status = 500;
        ctx.body = { error: 'Internal Server Error' };
    }
};

// 注册
const registerUser = async (ctx) => {
    const { username, password } = ctx.request.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ uid: new mongoose.Types.ObjectId(), name: username, password: hashedPassword });
        await user.save();

        const token = jwt.sign({ id: user.uid, username: user.name }, secretKey);
        ctx.body = { token };
    } catch (error) {
        ctx.status = 500;
        ctx.body = { error: 'Internal Server Error' };
    }
};

module.exports = { loginUser, registerUser };
