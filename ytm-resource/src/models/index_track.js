var mongoose = require('mongoose');

const indexTrackSchema = mongoose.Schema({
    track_id: Number,
    cover: String,
    title: String,
    description: String
});
  
// 创建并导出模型
const IndexTrack = mongoose.model('IndexTrack', indexTrackSchema);
module.exports = IndexTrack;