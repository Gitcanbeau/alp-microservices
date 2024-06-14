var mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = mongoose.Schema({
  uid: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  password: { type: String, required: true }, // 新增密码字段
  secret: String,
  subscribe: {
    type: String,
    default: "Premium"
  },
  subscribe_expired: String,
  last_login: String,
  playing: String
});

// 在保存用户之前，对密码进行哈希处理
// userSchema.pre('save', async function(next) {
//   if (!this.isModified('password')) {
//     return next();
//   }
//   try {
//     const salt = await bcrypt.genSalt(10);
//     this.password = await bcrypt.hash(this.password, salt);
//     next();
//   } catch (err) {
//     next(err);
//   }
// });

// 在保存用户之前，对密码进行哈希处理
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  try {
    // 仅在密码不是哈希值时进行哈希处理
    if (!this.password.startsWith('$2a$')) {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
    }
    next();
  } catch (err) {
    next(err);
  }
});

// 添加密码比较方法
userSchema.methods.comparePassword = function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// 创建并导出模型
const User = mongoose.model('User', userSchema);
module.exports = User;
