const mongoose = require('mongoose');

const indexLibrarySchema = mongoose.Schema({
  track_id: String,
  title: String,
  artist: [String],
  album: String,
  album_id: Number,
  genre: String,
  copyright: String,
  length: String,
  track_number: Number,
  quality: String,
  file: String
});

// 创建并导出模型
const IndexLibrary = mongoose.model('IndexLibrary', indexLibrarySchema);
module.exports = IndexLibrary;