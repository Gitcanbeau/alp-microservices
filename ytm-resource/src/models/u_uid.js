var mongoose = require('mongoose');

const uUidSchema = mongoose.Schema({
    type: String,
    id: String,
    added_date: String
  });
  
// 创建并导出模型
const uUid = mongoose.model('uUid', uUidSchema);
module.exports = uUid;