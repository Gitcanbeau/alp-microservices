var mongoose = require('mongoose');

const indexPlaylistSchema = mongoose.Schema({
  pid: Number,
  author: String,
  name: String,
  description: String,
  added: 0,
  liked: 0,
  shared: 0,
  played: 0,
  public: true,
  image: String,
  type:String,
  last_update: String
});
  
// 创建并导出模型
const IndexPlaylist = mongoose.model('IndexPlaylist', indexPlaylistSchema);
module.exports = IndexPlaylist;