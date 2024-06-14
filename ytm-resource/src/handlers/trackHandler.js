const jwt = require('jsonwebtoken');
const IndexLibrary = require('../models/index_library.js');
const IndexPlaylist = require('../models/index_playlist.js');
const user = require('../models/user.js');
const IndexTrack = require('../models/index_track.js');
const UserLibrary = require('../models/user_library.js');

// 获取所有歌曲列表
async function getAllTracks(ctx) {
    try {
        const tracks = await IndexTrack.find({}, 'id cover title description');
        ctx.body = {
            data: tracks,
            total: tracks.length
        };
    } catch (err) {
        ctx.status = 500;
        ctx.body = { err: 201, msg: 'Internal Server Error' };
    }
}

// 获取单条歌曲信息
async function getTrackById(ctx) {
    try {
        const track = await IndexTrack.findOne({ track_id: ctx.params.track_id });
        if (!track) {
            ctx.status = 404;
            ctx.body = { err: 201, msg: "Resource doesn't exist" };
            return;
        }
        ctx.body = {
            data: track
        };
    } catch (err) {
        ctx.status = 500;
        ctx.body = { err: 201, msg: 'Internal Server Error' };
    }
}

// 将歌曲添加到用户收藏中
async function addTrackToUserLibrary(ctx) {
    try {
        const token = ctx.headers.authorization;
        const decoded = jwt.decode(token);

        if (!decoded || !decoded.uid) {
            ctx.status = 401;
            ctx.body = { error: 'Unauthorized: Invalid token' };
            return;
        }

        const uid = decoded.uid;
        const trackId = ctx.params.track_id;

        // 检查歌曲是否存在
        const track = await IndexTrack.findOne({ track_id: trackId });
        if (!track) {
            ctx.status = 404;
            ctx.body = { error: 'Track not exist' };
            return;
        }

        // 将歌曲添加到用户的收藏中
        const userLibrary = await UserLibrary.findOne({ user_id: uid });
        if (!userLibrary) {
            // 如果用户没有收藏列表，则创建一个新的
            await UserLibrary.create({ user_id: uid, tracks: [trackId] });
        } else {
            // 如果用户已有收藏列表，则添加歌曲ID
            userLibrary.tracks.push(trackId);
            await userLibrary.save();
        }

        ctx.status = 200;
        ctx.body = { msg: 'Track added to user library' };
    } catch (err) {
        ctx.status = 500;
        ctx.body = { error: 'Internal Server Error' };
    }
}

// 删除用户收藏的歌曲
async function deleteTrackFromUserLibrary(ctx) {
    try {
        const token = ctx.headers.authorization;
        const decoded = jwt.decode(token);

        if (!decoded || !decoded.uid) {
            ctx.status = 401;
            ctx.body = { error: 'Unauthorized: Invalid token' };
            return;
        }

        const uid = decoded.uid;
        const trackId = ctx.params.track_id;

        // 检查歌曲是否存在于用户的收藏中
        const userLibrary = await UserLibrary.findOne({ user_id: uid });
        if (!userLibrary || !userLibrary.tracks.includes(trackId)) {
            ctx.status = 404;
            ctx.body = { error: 'Track not found in user library' };
            return;
        }

        // 从用户的收藏中删除歌曲ID
        userLibrary.tracks = userLibrary.tracks.filter(id => id !== trackId);
        await userLibrary.save();

        ctx.status = 200;
        ctx.body = { msg: 'Track removed from user library' };
    } catch (err) {
        ctx.status = 500;
        ctx.body = { error: 'Internal Server Error' };
    }
}

// Export the functions
module.exports = {
    getAllTracks,
    getTrackById,
    addTrackToUserLibrary,
    deleteTrackFromUserLibrary
};
