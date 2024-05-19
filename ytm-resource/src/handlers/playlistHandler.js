// playlistHandler.js

const IndexLibrary = require('./models/index_library.js');
const IndexPlaylist = require('./models/index_playlist.js');
const user = require('./models/user.js');
const IndexTrack = require('./models/index_track.js');
const UserLibrary = require('./models/user_library.js');

// 获取所有播放列表
async function getAllPlaylists (ctx){
    // 解析 JWT Token 中的用户信息
    const token = ctx.headers.authorization;
    const decoded = jwt.decode(token);

    // 检查是否提供了有效的 Token
    if (!decoded || !decoded.uid) {
        ctx.status = 401;
        ctx.body = { error: 'Unauthorized: Invalid token' };
        return;
    }

    const uid = decoded.uid;

    try {
        const { _user, _type, _sort, _ascending } = ctx.query;

        const token = ctx.headers.authorization;
        const decoded = jwt.decode(token);

        if (!decoded || !decoded.uid) {
            ctx.status = 401;
            ctx.body = { error: 'Unauthorized: Invalid token' };
            return;
        }

        const uid = decoded.uid;

        // 获取用户个人曲库数据
        const userLibrary = await UserLibrary.findOne({ uid });

        if (!userLibrary) {
            ctx.status = 404;
            ctx.body = { error: 'User library not found' };
            return;
        }

        // 根据 _type 获取相应数据
        let data;
        if (_type === 'library') {
            data = userLibrary.library.filter(item => item.type === 'album' || item.type === 'track');
        } else if (_type === 'playlist') {
            // 获取用户的播放列表
            //data = await Playlist.find({ pid: { $in: userLibrary.playlists } });
            // 获取用户的播放列表
            const playlists = await Playlist.find({ pid: { $in: userLibrary.playlists }, public: true }); // 只返回 public=true 的播放列表
            data = playlists.map(playlist => {
                return {
                    pid: playlist.pid,
                    name: playlist.name,
                    description: playlist.description,
                    public: playlist.public
                };
            });
        } else {
            ctx.status = 400;
            ctx.body = { error: 'Invalid _type parameter' };
            return;
        }

        // 根据 _sort 和 _ascending 对数据进行排序

        if (_sort && _ascending) {
            data = data.sort((a, b) => a[_sort] > b[_sort] ? 1 : -1);
        } else if (_sort && !_ascending) {
            data = data.sort((a, b) => a[_sort] < b[_sort] ? 1 : -1);
        }

        // 返回数据
        ctx.body = {
            data: libraryData,
            total: libraryData.length
        };
    } catch (err) {
        ctx.status = 500;
        ctx.body = { err: 201, msg: 'Internal Server Error' };
    }
};

// 获取单个播放列表的信息
async function getPlaylistById (ctx) {
    try {
        const playlist = await IndexPlaylist.findOne({ pid: ctx.params.pid });
        if (!playlist) {
          ctx.status = 404;
          ctx.body = { err: 201, msg: "Resource doesn't exist" };
          return;
        }
        ctx.body = {
          data: playlist
        };
    } catch (err) {
        ctx.status = 500;
        ctx.body = { err: 201, msg: 'Internal Server Error' };
    }
};

// 创建播放列表
async function createPlaylist (ctx){
    // 实现代码
};

// 将播放列表添加到用户收藏中
async function addPlaylistToUserLibrary (ctx) {
    try {
        const token = ctx.headers.authorization;
        const decoded = jwt.decode(token);

        if (!decoded || !decoded.uid) {
            ctx.status = 401;
            ctx.body = { error: 'Unauthorized: Invalid token' };
            return;
        }

        const uid = decoded.uid;
        const pid = ctx.params.pid;
        const { item } = ctx.request.body;

        // 根据 pid 查找播放列表
        const playlist = await Playlist.findOne({ pid });

        if (!playlist) {
            ctx.status = 404;
            ctx.body = { error: 'Playlist not found' };
            return;
        }

        // 验证用户是否有权限修改该播放列表
        if (playlist.author !== uid) {
            ctx.status = 403;
            ctx.body = { error: 'Forbidden: You do not have permission to update this playlist' };
            return;
        }

        // 更新播放列表
        playlist.items.push(item);
        await playlist.save();

        ctx.body = playlist;
    } catch (error) {
        console.error('An error occurred:', error);
        ctx.status = 500;
        ctx.body = { error: 'Internal Server Error' };
    }
};

// 删除用户收藏的播放列表
async function deletePlaylistFromUserLibrary (ctx) {
    try {
        const token = ctx.headers.authorization;
        const decoded = jwt.decode(token);

        if (!decoded || !decoded.uid) {
            ctx.status = 401;
            ctx.body = { error: 'Unauthorized: Invalid token' };
            return;
        }

        const uid = decoded.uid;
        const pid = ctx.params.pid;

        // 根据 pid 查找播放列表
        const playlist = await Playlist.findOne({ pid });

        if (!playlist) {
            ctx.status = 404;
            ctx.body = { error: 'Playlist not found' };
            return;
        }

        // 验证用户是否有权限删除该播放列表
        if (playlist.author !== uid) {
            ctx.status = 403;
            ctx.body = { error: 'Forbidden: You do not have permission to delete this playlist' };
            return;
        }

        // 从用户个人曲库中删除该播放列表的 pid
        await UserLibrary.updateOne({ uid }, { $pull: { playlists: pid } });

        // 将播放列表的 public 字段设为 false
        await Playlist.updateOne({ pid }, { $set: { public: false } });

        ctx.status = 204;
    } catch (error) {
        console.error('An error occurred:', error);
        ctx.status = 500;
        ctx.body = { error: 'Internal Server Error' };
    }
};


// Export the functions
module.exports = {
    getAllPlaylists,
    getPlaylistById,
    createPlaylist,
    addPlaylistToUserLibrary,
    deletePlaylistFromUserLibrary
};