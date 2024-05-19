var mongoose = require('mongoose');

const userSchema = mongoose.Schema({
  uid: String,
  name: String,
  secret: String,
  subscribe: {type: String,
    default:"Premium"
  },
  subscribe_expired: String,
  last_login: String,
  playing: String
});
  
// 创建并导出模型
const user = mongoose.model('user', userSchema);
module.exports = user;