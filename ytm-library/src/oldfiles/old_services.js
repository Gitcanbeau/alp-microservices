import mongoose from 'mongoose';
import fs from 'fs';
import pathModule from 'path';
import os from 'os';
import { parseFile } from 'music-metadata';
import { DynamicPool } from 'node-worker-threads-pool';
import crypto from 'crypto';
import tag from './tag.js';
import IndexLibrary from '../models/index_library.js';
import IndexPlaylist from '../models/index_playlist.js'

class datafromMain{
  constructor(pid, storePath, file, metadata){
    this.pid = pid;
    this.storePath = storePath;
    this.metadata = metadata;
    this.file = file;
  }
}

async function process(data){
  // const fs = this.require('fs');
  // const crypto = this.require('crypto');
  // const IndexLibrary = this.require('./models/index_library.js');
  // const tag = this.require('./tag.js');
  //最上面已经import过了，可能不需要上面的东西
  const metadata = await data.metadata;
  const file = data.file;

  //时间转化
  const seconds = Math.ceil(metadata.format.duration); 
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  const formattedMinutes = String(minutes).padStart(2, '0');
  //converts the numerical value of minutes to a string.
  //This is a method that ensures the string representation of minutes is at least 2 characters long. 
  //If the string length is less than 2, 
  //it pads the string with zeros at the start until it reaches the desired length of 2.
  const formattedSeconds = String(remainingSeconds).padStart(2, '0');
  const time = `${formattedMinutes}:${formattedSeconds}`;
  console.log(time);
  
  //提取信息
  
  var artist =  metadata.common.artist || 'Unknown Artist';
  var title  = metadata.common.title || 'Unknown Title';
  var genre = metadata.common.genre || 'Unknown Genre';
  var copyright = metadata.common.copyright || 'Unknown Copyright';
  var album = metadata.common.album || 'Unknown Album';
  var album_id = data.pid;
  
  //计算track_id
  var total = artist + '' + title + '' + album;
  var sliceResult = total.slice(0,16);
  //extracts a substring from the total string, starting at index 0 and ending at index 16 (exclusive)
  const md5Hash = crypto.createHash('md5');
  md5Hash.update(sliceResult);
  //updates the hash object (md5Hash) with the data from the sliceResult string.
  var track_id = md5Hash.digest('hex');
  //The 'hex' encoding specifies that the output should be in hexadecimal format. 
  //The resulting hash value is assigned to the variable track_id.
  console.log(track_id);

  //如果封面有图片，则另外将图片存储起来
  if(metadata.common.picture && metadata.common.picture.length > 0){
    for(let i = 0;i< metadata.common.picture.length;i++){
      if(i == 0){
          var store = pathModule.join(data.storePath, `${album_id}.jpg`);
      }else{
          var store = pathModule.join(data.storePath, `${album_id}(${i-1}).jpg`);
      }
      const rawImageData = jpeg.decode(metadata.common.picture[i]);
      const encodedImageData = jpeg.encode(rawImageData, 100);
      fs.writeFileSync(store, encodedImageData.data);
    }
  }

  //将tag写入数据库
  return new tag(track_id, title, artist, album , album_id, genre, copyright, time, data.file);
}

/*librartInit
在不存在index.json文件时读取./library内的音乐文件，并且创建index.json
*/
/*
//第一种写法没有使用mutex所以不能avoid race conditions and data inconsistencies
async function libraryInit(path){

  //初始化线程池并且设置一些参数
  const dynamicPool = new DynamicPool(os.cpus().length); 
  //a new instance of DynamicPool is created with the number of available CPU cores obtained from os.cpus().length. 
  //This pool will manage worker threads for parallel processing.
  var pid = 0;
  //存放图片的文件夹路径
  const storePath =  pathModule.join(path, 'cover');
 
  const items = fs.readdirSync(path);
  const taskPromises = [];
  
  const playlists = {};
  // playlist object to store playlists based on album

  for (const item of items) {
    const itemPath = pathModule.join(path, item);
    const stat = fs.statSync(itemPath);

    if(stat.isFile() && pathModule.extname(itemPath) !== '.json') {
      //如果是音乐文件，则设置任务交给线程池处理
      const metadata = await parseFile(itemPath);

      const album = metadata.common.album || 'Unknown Album';

      // Create a playlist if it doesn't exist for this album
      if (!playlists[album]) {
          const playlist = new IndexPlaylist({
              pid: Math.floor(Math.random() * 1000), // Generate a random pid
              name: album,
              // You can add more properties to the playlist here
          });
          await playlist.save();
          playlists[album] = playlist;
      }

      var data = new datafromMain(pid,storePath,itemPath,metadata);

      const taskPromise = dynamicPool
      .exec({
          
        task:process,
        param: data
      })
      .then(async (result) => {

        console.log(result);
        var track_id = result.track_id;
        var title = result.title;
        var artist = result.artist;
        var album= result.album;
        var album_id = result.album_id;
        var genre = result.genre;
        var copyright = result.copyright;
        var time = result.time;
      
        var file = result.file;
        const document = new IndexLibrary({
            track_id,
            title,
            artist,
            album,
            album_id,
            genre,
            copyright,
            time,
            track_number:0,
            quality:'STD',
            file
        })
        document.save();
      // Add the document to the playlist
        playlists[album].tracks.push(document);
        await playlists[album].save();
        
      });
      taskPromises.push(taskPromise);
      pid = pid + 1;
    }

      
  }

  //等待所有任务完成
  await Promise.all(taskPromises);

  //终止线程池
  dynamicPool.destroy();    
}
*/


//第二种写法使用mutex to avoid race conditions and data inconsistencies
async function libraryInit(path) {
  // 初始化线程池并设置一些参数
  const dynamicPool = new DynamicPool(os.cpus().length);
  let pid = 0;
  const storePath = pathModule.join(path, 'cover');
  
  const items = fs.readdirSync(path);
  const taskPromises = [];

  // Playlist object to store playlists based on album
  const playlists = {};
  
  // Mutex to ensure exclusive access to the playlists object
  const mutex = new Mutex();

  for (const item of items) {
    const itemPath = pathModule.join(path, item);
    const stat = fs.statSync(itemPath);

    if (stat.isFile() && pathModule.extname(itemPath) !== '.json') {
      const metadata = await parseFile(itemPath);
      const album = metadata.common.album || 'Unknown Album';

      // Use mutex to ensure exclusive access to playlists object
      const release = await mutex.acquire();
      try {
          // Create a playlist if it doesn't exist for this album
          if (!playlists[album]) {
              const playlist = new IndexPlaylist({
                  pid: Math.floor(Math.random() * 1000), // Generate a random pid
                  name: album,
                  // You can add more properties to the playlist here
              });
              await playlist.save();
              playlists[album] = playlist;
          }
      } finally {
          release(); // Release the mutex lock
      }

      const data = new datafromMain(pid, storePath, itemPath, metadata);

      const taskPromise = dynamicPool.exec({
          task: process,
          param: data
      }).then(async (result) => {
          console.log(result);
          const track_id = result.track_id;
          const title = result.title;
          const artist = result.artist;
          const album = result.album;
          const album_id = result.album_id;
          const genre = result.genre;
          const copyright = result.copyright;
          const time = result.time;
          const file = result.file;

          const document = new IndexLibrary({
            track_id,
            title,
            artist,
            album,
            album_id,
            genre,
            copyright,
            time,
            track_number: 0,
            quality: 'STD',
            file
          });
          await document.save();
          // Use mutex to ensure exclusive access to playlists object
          const release = await mutex.acquire();
          try {
            // Add the document to the playlist
            playlists[album].tracks.push(document);
            await playlists[album].save();
          } finally {
            release(); // Release the mutex lock
          }
      });
      taskPromises.push(taskPromise);
      pid++;
    }
  }

  // 等待所有任务完成
  await Promise.all(taskPromises);

  // 终止线程池
  dynamicPool.destroy();
}


/*
扫描一遍并更新
*/
async function libraryUpload(path,db){
  const storePath =  pathModule.join(path, 'cover');
  const indexPath =  pathModule.join(path, 'index.json') ;   
  const documents = await IndexLibrary.find({});
  // 提取所有文档的 track_id 字段
  const tags = documents;
  var ids = [];
  var newtags = [];

  var pid = 0;

  //获取音乐文件列表
  const items = fs.readdirSync(path);
  for(const item of items) {
    const itemPath = pathModule.join(path, item);
    const stat = fs.statSync(itemPath);

    if(stat.isFile() && pathModule.extname(itemPath) !== '.json'){
      const metadata = await parseFile(itemPath);
      
      //提取信息
    
      var artist =  metadata.common.artist || 'Unknown Artist';
      var title  = metadata.common.title || 'Unknown Title';
      var genre = metadata.common.genre || 'Unknown Genre';
      var copyright = metadata.common.copyright || 'Unknown Copyright';
      var album = metadata.common.album || 'Unknown Album';
      var album_id = pid;

      //计算track_id
      var total = artist + '' + title + '' + album;
      var sliceResult = total.slice(0,16);
      const md5Hash = crypto.createHash('md5');
      md5Hash.update(sliceResult);
      var track_id = md5Hash.digest('hex');
      console.log(track_id);
      
      //检查是否在index.json内
      var isFind = false;
      var id = 0;
      
      for (const tag of tags){
        if(tag.track_id === track_id){//如果找到了，则设置标志位为true,同时记录id
          isFind = true;
          tag.pid = album_id;
          ids.push(track_id);
          break;
        }
        id = id + 1;
      }

      if(isFind){//如果找到了
        
      }else{//没找到则需要计算tag
        var album_id = 0;
        //时间转化
        const seconds = Math.ceil(metadata.format.duration); 
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        const formattedMinutes = String(minutes).padStart(2, '0');
        const formattedSeconds = String(remainingSeconds).padStart(2, '0');
        const time = `${formattedMinutes}:${formattedSeconds}`;
        
        //如果封面有图片，则另外将图片存储起来
        if(metadata.common.picture && metadata.common.picture.length > 0){
          for(var i = 0;i< metadata.common.picture.length;i++){
              if(i == 0){
                  var store = pathModule.join(storePath, `${album_id}.jpg`);
              }else{
                  var store = pathModule.join(storePath, `${album_id}(${i-1}).jpg`);
                }
              var rawImageData = jpeg.decode(metadata.common.picture[i]);
              var encodedImageData = jpeg.encode(rawImageData, 100);
              fs.writeFileSync(store, encodedImageData.data);
          }
        }  
        
        newtags.push(new tag(track_id, title, artist, album, album_id, genre, copyright, time, itemPath));
      }
    }

    pid = pid + 1;
  }

  //删除一部分tag
  try {
    // 用于筛选要删除的文档的查询条件
    const query = { track_id: { $nin: ids } }; // 不在集合中的 id
    
    const result = await IndexLibrary.deleteMany(query);
    console.log(`已删除 ${result.deletedCount} 个文档。`);
  } catch (err) {
    console.error(err);
  }

  //将更新完成之后的tags写回index.

  for(const newtag of newtags){
    var track_id = newtag.track_id;
    var title = newtag.title;
    var artist = newtag.artist;
    var album= newtag.album;
    var album_id = newtag.album_id;
    var genre = newtag.genre;
    var copyright = newtag.copyright;
    var time = newtag.time;
    var file = newtag.file;

    const document = new IndexLibrary({
      track_id,
      title,
      artist,
      album,
      album_id,
      genre,
      copyright,
      time,
      track_number:0,
      quality:'STD',
      file
    })

    document.save();
  }
}


/*
在library文件夹内寻找index.json文件
如果找到，则读取index.json文件至内存,并且用libraryUpload函数进行处理
如果没找到，则调用libraryInit函数来初始化index.json文件
*/
function libraryLoad(path){

    mongoose.connect('mongodb://localhost/library');
    var db = mongoose.connection;
    db.on('error', function(error) {
      console.error('Database connection error:', error);
    });

    IndexLibrary.find({})
    .then( async res => {
      if(res.length === 0){//表明此时数据库内没有数据
        console.log(res.length);
        libraryInit(path);
        
      }else{
        libraryUpload(path);
      }

    })
    .catch(err => {
      console.log(err);
    })

}

export{libraryLoad};