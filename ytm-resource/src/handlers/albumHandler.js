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
async function addAlbumToUserLibrary(ctx) {
    try {
        const userId = ctx.state.user.id; // 假设用户ID存储在JWT token中
        const albumId = ctx.params.album_id;

        // 检查专辑是否存在
        const album = await IndexLibrary.findOne({ album_id: albumId });
        if (!album) {
            ctx.status = 404;
            ctx.body = { err: 201, msg: "Album doesn't exist" };
            return;
        }

        // 将专辑添加到用户的收藏中
        const userLibrary = await UserLibrary.findOne({ user_id: userId });
        if (!userLibrary) {
            // 如果用户没有收藏列表，则创建一个新的
            await UserLibrary.create({ user_id: userId, albums: [albumId] });
        } else {
            // 如果用户已有收藏列表，则添加专辑ID
            userLibrary.albums.push(albumId);
            await userLibrary.save();
        }

        ctx.status = 200;
        ctx.body = { msg: 'Album added to user library' };
    } catch (err) {
        ctx.status = 500;
        ctx.body = { err: 201, msg: 'Internal Server Error' };
    }
}

// 删除用户收藏的专辑
async function deleteAlbumFromUserLibrary(ctx) {
    try {
        const userId = ctx.state.user.id; // 假设用户ID存储在JWT token中
        const albumId = ctx.params.album_id;

        // 检查专辑是否存在于用户的收藏中
        const userLibrary = await UserLibrary.findOne({ user_id: userId });
        if (!userLibrary || !userLibrary.albums.includes(albumId)) {
            ctx.status = 404;
            ctx.body = { err: 201, msg: "Album not found in user library" };
            return;
        }

        // 从用户的收藏中删除专辑ID
        userLibrary.albums = userLibrary.albums.filter(id => id !== albumId);
        await userLibrary.save();

        ctx.status = 200;
        ctx.body = { msg: 'Album removed from user library' };
    } catch (err) {
        ctx.status = 500;
        ctx.body = { err: 201, msg: 'Internal Server Error' };
    }
}

// Export the functions
module.exports = {
    getAllAlbums,
    getAlbumById,
    addAlbumToUserLibrary,
    deleteAlbumFromUserLibrary
};
