// apiRoutes.js

const KoaRouter = require('koa-router');
const router = new KoaRouter();

// Import handlers for each API endpoint

const libraryHandler = require('./handlers/libraryHandler');
const trackHandler = require('./handlers/trackHandler');
const playlistHandler = require('./handlers/playlistHandler');
const userHandler = require('./handlers/userHandler');
// Import any other handlers for additional APIs

// Define routes for album-related APIs
router.get('/album', albumHandler.getAllAlbums);
router.get('/album/:pid', albumHandler.getAlbumById);
router.put('/album/:pid', albumHandler.addAlbumToUserLibrary);
router.delete('/album/:pid', albumHandler.deleteAlbumFromUserLibrary);

// Define routes for playlist-related APIs
router.get('/playlist', playlistHandler.getAllPlaylists);
router.get('/playlist/:pid', playlistHandler.getPlaylistById);
router.post('/playlist', playlistHandler.createPlaylist);
router.put('/playlist/:pid', playlistHandler.addPlaylistToUserLibrary);
router.delete('/playlist/:pid', playlistHandler.deletePlaylistFromUserLibrary);

// Define routes for track-related APIs
router.get('/track', trackHandler.getAllTracks);
router.get('/track/:track_id', trackHandler.getTrackById);
router.put('/track/:track_id', trackHandler.addTrackToUserLibrary);
router.delete('/track/:track_id', trackHandler.deleteTrackFromUserLibrary);

// Define routes for user-related APIs
router.get('/user/:uid', userHandler.getUserInfo);
router.post('/user/:uid', userHandler.recordUserPlayStatus);

// 获取专辑封面图片
router.get('/image/:album_id', async (ctx) => {
    // 实现代码
});

module.exports = router;
