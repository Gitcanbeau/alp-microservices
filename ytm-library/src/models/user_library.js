// models/user_library.js

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// 定义用户个人曲库模式
const UserLibrarySchema = new Schema({
    uid: { type: String, required: true }, // 用户 ID
    data: [ // 包含专辑和音轨的数组
        {
            type: { type: String, required: true }, // 条目类型，可能是 'album' 或 'track'
            
        }
    ]
});

const UserLibrary = mongoose.model('UserLibrary', UserLibrarySchema);

module.exports = UserLibrary;
