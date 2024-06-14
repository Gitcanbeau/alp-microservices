const jwt = require('jsonwebtoken');
const IndexLibrary = require('../models/index_library.js');
const IndexPlaylist = require('../models/index_playlist.js');
const user = require('../models/user.js');
const IndexTrack = require('../models/index_track.js');
const UserLibrary = require('../models/user_library.js');

const userPlayingStatus = {}; // 确保在模块顶部声明该变量

// 获取用户统计信息
async function getUserInfo(ctx) {
    try {
        const token = ctx.headers.authorization;
        const decoded = jwt.decode(token);

        if (!decoded || !decoded.uid) {
            ctx.status = 401;
            ctx.body = { error: 'Unauthorized: Invalid token' };
            return;
        }

        const uid = decoded.uid;

        const userLibrary = await UserLibrary.findOne({ user_id: uid });
        if (!userLibrary) {
            ctx.status = 404;
            ctx.body = { error: 'User library not found' };
            return;
        }

        const albumCount = userLibrary.albums.length;
        const playlistCount = userLibrary.playlists.length;
        const trackCount = userLibrary.tracks.length;

        ctx.body = {
            albums: albumCount,
            playlists: playlistCount,
            tracks: trackCount
        };
    } catch (err) {
        ctx.status = 500;
        ctx.body = { error: 'Internal Server Error' };
    }
}

// 记录用户播放状态
async function recordUserPlayStatus(ctx) {
    try {
        const { uid } = ctx.params;
        const { playing } = ctx.request.body;

        userPlayingStatus[uid] = playing;
        ctx.status = 200;
        ctx.body = { message: 'Play status recorded successfully' };
    } catch (err) {
        ctx.status = 500;
        ctx.body = { error: 'Internal Server Error' };
    }
}

// Export the functions
module.exports = {
    getUserInfo,
    recordUserPlayStatus
};

