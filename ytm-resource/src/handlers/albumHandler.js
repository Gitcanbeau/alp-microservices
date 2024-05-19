// albumHandler.js

const IndexLibrary = require('./models/index_library.js');
const IndexPlaylist = require('./models/index_playlist.js');
const user = require('./models/user.js');
const IndexTrack = require('./models/index_track.js');
const UserLibrary = require('./models/user_library.js');


// 获取数据库中的所有album列表
async function getAllAlbums (ctx) {
    try {
        const albums = await IndexLibrary.find({}, 'album album_id');
        ctx.body = {
          data: albums,
          total: albums.length
        };
    } catch (err) {
        ctx.status = 500;
        ctx.body = { err: 201, msg: 'Internal Server Error' };
    }
};
  
// 获取单个album的信息
async function getAlbumById (ctx){
    try {
        const album = await IndexLibrary.findOne({ album_id: ctx.params.pid });
        if (!album) {
          ctx.status = 404;
          ctx.body = { err: 201, msg: "Resource doesn't exist" };
          return;
        }
        ctx.body = {
          data: album
        };
    } catch (err) {
        ctx.status = 500;
        ctx.body = { err: 201, msg: 'Internal Server Error' };
    }
};

// 将专辑添加到用户收藏中
async function addAlbumToUserLibrary (ctx){
    // 实现代码
};

// 删除用户收藏的专辑
async function deleteAlbumFromUserLibrary (ctx) {
    // 实现代码
};

// Export the functions
module.exports = {
    getAllAlbums,
    getAlbumById,
    addAlbumToUserLibrary,
    deleteAlbumFromUserLibrary
};
