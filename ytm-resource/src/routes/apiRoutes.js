// apiRoutes.js

const KoaRouter = require('koa-router');
const router = new KoaRouter();

// Import handlers for each API endpoint
const albumHandler = require('../handlers/albumHandler');
const playlistHandler = require('../handlers/playlistHandler');
const trackHandler = require('../handlers/trackHandler');
const userHandler = require('../handlers/userHandler');
const authHandler = require('../handlers/authHandler'); // 引入认证处理器

// Import JWT authentication middleware
const jwtAuthMiddleware = require('../middlewares/jwtAuth');

// Define routes for album-related APIs
router.get('/album', jwtAuthMiddleware, albumHandler.getAllAlbums);
router.get('/album/:pid', jwtAuthMiddleware, albumHandler.getAlbumById);
router.put('/album/:pid', jwtAuthMiddleware, albumHandler.addAlbumToUserLibrary);
router.delete('/album/:pid', jwtAuthMiddleware, albumHandler.deleteAlbumFromUserLibrary);

// Define routes for playlist-related APIs
router.get('/playlist', playlistHandler.getAllPlaylists);
router.get('/playlist/:pid', jwtAuthMiddleware, playlistHandler.getPlaylistById);
router.post('/playlist', jwtAuthMiddleware, playlistHandler.createPlaylist);
router.put('/playlist/:pid', jwtAuthMiddleware, playlistHandler.addPlaylistToUserLibrary);
router.delete('/playlist/:pid', jwtAuthMiddleware, playlistHandler.deletePlaylistFromUserLibrary);

// Define routes for track-related APIs
router.get('/track', trackHandler.getAllTracks);
router.get('/track/:track_id', jwtAuthMiddleware, trackHandler.getTrackById);
router.put('/track/:track_id', jwtAuthMiddleware, trackHandler.addTrackToUserLibrary);
router.delete('/track/:track_id', jwtAuthMiddleware, trackHandler.deleteTrackFromUserLibrary);

// Define routes for user-related APIs
router.get('/user/:uid', jwtAuthMiddleware, userHandler.getUserInfo);
router.post('/user/:uid', jwtAuthMiddleware, userHandler.recordUserPlayStatus);

// Define routes for authentication-related APIs
router.post('/login', authHandler.loginUser);      // 登录路由
router.post('/register', authHandler.registerUser); // 注册路由

// 获取专辑封面图片
router.get('/image/:album_id', async (ctx) => {
    // 实现代码
});

module.exports = router;
