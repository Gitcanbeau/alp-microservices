const mongoose = require('mongoose');

const indexPlaylistSchema = mongoose.Schema({
  pid: Number,
  author: String,
  name: String,
  description: String,
  added: Number,
  liked: Number,
  shared: Number,
  played: Number,
  public: Boolean,
  image: String,
  type: String,
  last_update: String
});

// 创建并导出模型
const IndexPlaylist = mongoose.model('IndexPlaylist', indexPlaylistSchema);
module.exports = IndexPlaylist;
