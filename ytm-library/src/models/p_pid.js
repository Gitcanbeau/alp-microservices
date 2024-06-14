var mongoose = require('mongoose');

const pPidSchema = mongoose.Schema({
    tid: Number
});
  
// 创建并导出模型
const pPid = mongoose.model('pPid', pPidSchema);
module.exports = pPid;