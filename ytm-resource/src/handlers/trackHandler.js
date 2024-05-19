// trackHandler.js

const IndexLibrary = require('./models/index_library.js');
const IndexPlaylist = require('./models/index_playlist.js');
const user = require('./models/user.js');
const IndexTrack = require('./models/index_track.js');
const UserLibrary = require('./models/user_library.js');

// 获取所有歌曲列表
async function getAllTracks (ctx) {
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
};

// 获取单条歌曲信息
async function getTrackById (ctx) {
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
};

// 将歌曲添加到用户收藏中
async function addTrackToUserLibrary (ctx){
    // 实现代码
};

// 删除用户收藏的歌曲
async function deleteTrackFromUserLibrary(ctx){
    // 实现代码
};


// Export the functions
module.exports = {
  getAllTracks,
  getTrackById,
  addTrackToUserLibrary,
  deleteTrackFromUserLibrary
};