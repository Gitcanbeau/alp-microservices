// userHandler.js

const IndexLibrary = require('./models/index_library.js');
const IndexPlaylist = require('./models/index_playlist.js');
const user = require('./models/user.js');
const IndexTrack = require('./models/index_track.js');
const UserLibrary = require('./models/user_library.js');

// 获取用户统计信息
async function getUserInfo(ctx) {
    // 实现代码
};

// 记录用户播放状态
async function recordUserPlayStatus (req, res) {
    const { uid } = req.params;
    const { playing } = req.body;

    userPlayingStatus[uid] = playing;
    res.sendStatus(200);
};

// Export the functions
module.exports = {
    getUserInfo,
    recordUserPlayStatus
};
