const bcrypt = require('bcryptjs');

let users = []; // 这是一个简单的内存存储，可以替换为数据库

const addUser = async (username, password) => {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = { username, password: hashedPassword };
    users.push(user);
    return user;
};

const findUser = async (username) => {
    return users.find(user => user.username === username);
};

module.exports = { addUser, findUser };
