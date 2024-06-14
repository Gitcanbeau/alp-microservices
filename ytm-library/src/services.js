const mongoose = require('mongoose');
const fs = require('fs');
const pathModule = require('path');
const os = require('os');
const { parseFile } = import ('music-metadata');
const { DynamicPool } = require('node-worker-threads-pool');
const crypto = require('crypto');
const tag = require('./tag');
const IndexLibrary = require('./models/index_library');
const IndexPlaylist = require('./models/index_playlist');
const { Mutex } = require('async-mutex');

class datafromMain {
  constructor(pid, storePath, file, metadata) {
    this.pid = pid;
    this.storePath = storePath;
    this.metadata = metadata;
    this.file = file;
  }
}

async function process(data) {
  const metadata = await data.metadata;
  const file = data.file;
  const seconds = Math.ceil(metadata.format.duration); 
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  const formattedMinutes = String(minutes).padStart(2, '0');
  const formattedSeconds = String(remainingSeconds).padStart(2, '0');
  const time = `${formattedMinutes}:${formattedSeconds}`;
  
  var artist = metadata.common.artist || 'Unknown Artist';
  var title = metadata.common.title || 'Unknown Title';
  var genre = metadata.common.genre || 'Unknown Genre';
  var copyright = metadata.common.copyright || 'Unknown Copyright';
  var album = metadata.common.album || 'Unknown Album';
  var album_id = data.pid;

  var total = artist + '' + title + '' + album;
  var sliceResult = total.slice(0,16);
  const md5Hash = crypto.createHash('md5');
  md5Hash.update(sliceResult);
  var track_id = md5Hash.digest('hex');

  if(metadata.common.picture && metadata.common.picture.length > 0){
    for(let i = 0; i < metadata.common.picture.length; i++){
      var store = i == 0 ? pathModule.join(data.storePath, `${album_id}.jpg`) : pathModule.join(data.storePath, `${album_id}(${i-1}).jpg`);
      const rawImageData = jpeg.decode(metadata.common.picture[i]);
      const encodedImageData = jpeg.encode(rawImageData, 100);
      fs.writeFileSync(store, encodedImageData.data);
    }
  }

  return new tag(track_id, title, artist, album, album_id, genre, copyright, time, data.file);
}

async function libraryInit(path) {
  const dynamicPool = new DynamicPool(os.cpus().length);
  let pid = 0;
  const storePath = pathModule.join(path, 'cover');
  const items = fs.readdirSync(path);
  const taskPromises = [];
  const playlists = {};
  const mutex = new Mutex();

  for (const item of items) {
    const itemPath = pathModule.join(path, item);
    const stat = fs.statSync(itemPath);

    if (stat.isFile() && pathModule.extname(itemPath) !== '.json') {
      const metadata = await parseFile(itemPath);
      const album = metadata.common.album || 'Unknown Album';

      const release = await mutex.acquire();
      try {
        if (!playlists[album]) {
          const playlist = new IndexPlaylist({
            pid: Math.floor(Math.random() * 1000),
            name: album,
          });
          await playlist.save();
          playlists[album] = playlist;
        }
      } finally {
        release();
      }

      const data = new datafromMain(pid, storePath, itemPath, metadata);
      const taskPromise = dynamicPool.exec({ task: process, param: data }).then(async (result) => {
        const { track_id, title, artist, album, album_id, genre, copyright, time, file } = result;
        const document = new IndexLibrary({ track_id, title, artist, album, album_id, genre, copyright, time, track_number: 0, quality: 'STD', file });
        await document.save();
        const release = await mutex.acquire();
        try {
          playlists[album].tracks.push(document);
          await playlists[album].save();
        } finally {
          release();
        }
      });
      taskPromises.push(taskPromise);
      pid++;
    }
  }

  await Promise.all(taskPromises);
  dynamicPool.destroy();
}

async function libraryUpload(path, db) {
  const storePath = pathModule.join(path, 'cover');
  const indexPath = pathModule.join(path, 'index.json');
  const documents = await IndexLibrary.find({});
  const tags = documents;
  var ids = [];
  var newtags = [];
  var pid = 0;
  const items = fs.readdirSync(path);

  for (const item of items) {
    const itemPath = pathModule.join(path, item);
    const stat = fs.statSync(itemPath);

    if (stat.isFile() && pathModule.extname(itemPath) !== '.json') {
      const metadata = await parseFile(itemPath);
      const artist = metadata.common.artist || 'Unknown Artist';
      const title = metadata.common.title || 'Unknown Title';
      const genre = metadata.common.genre || 'Unknown Genre';
      const copyright = metadata.common.copyright || 'Unknown Copyright';
      const album = metadata.common.album || 'Unknown Album';
      const album_id = pid;

      const total = artist + '' + title + '' + album;
      const sliceResult = total.slice(0, 16);
      const md5Hash = crypto.createHash('md5');
      md5Hash.update(sliceResult);
      const track_id = md5Hash.digest('hex');

      let isFind = false;
      let id = 0;

      for (const tag of tags) {
        if (tag.track_id === track_id) {
          isFind = true;
          tag.pid = album_id;
          ids.push(track_id);
          break;
        }
        id++;
      }

      if (!isFind) {
        const seconds = Math.ceil(metadata.format.duration);
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        const formattedMinutes = String(minutes).padStart(2, '0');
        const formattedSeconds = String(remainingSeconds).padStart(2, '0');
        const time = `${formattedMinutes}:${formattedSeconds}`;

        if (metadata.common.picture && metadata.common.picture.length > 0) {
          for (let i = 0; i < metadata.common.picture.length; i++) {
            const store = i == 0 ? pathModule.join(storePath, `${album_id}.jpg`) : pathModule.join(storePath, `${album_id}(${i-1}).jpg`);
            const rawImageData = jpeg.decode(metadata.common.picture[i]);
            const encodedImageData = jpeg.encode(rawImageData, 100);
            fs.writeFileSync(store, encodedImageData.data);
          }
        }

        newtags.push(new tag(track_id, title, artist, album, album_id, genre, copyright, time, itemPath));
      }
    }

    pid++;
  }

  try {
    const query = { track_id: { $nin: ids } };
    const result = await IndexLibrary.deleteMany(query);
    console.log(`已删除 ${result.deletedCount} 个文档。`);
  } catch (err) {
    console.error(err);
  }

  for (const newtag of newtags) {
    const { track_id, title, artist, album, album_id, genre, copyright, time, file } = newtag;
    const document = new IndexLibrary({ track_id, title, artist, album, album_id, genre, copyright, time, track_number: 0, quality: 'STD', file });
    await document.save();
  }
}

function libraryLoad(path) {
  mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  const db = mongoose.connection;
  db.on('error', (error) => console.error('Database connection error:', error));

  IndexLibrary.find({})
    .then(async (res) => {
      if (res.length === 0) {
        libraryInit(path);
      } else {
        libraryUpload(path);
      }
    })
    .catch((err) => {
      console.error(err);
    });
}

module.exports = { libraryLoad };
