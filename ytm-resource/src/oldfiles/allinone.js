const Koa = require('koa');
const Router = require('@koa/router');
const mongoose = require('mongoose');
const bodyParser = require('koa-bodyparser');

// 初始化 Koa 应用
const app = new Koa();
const router = new Router();

// 连接 MongoDB
mongoose.connect('mongodb://localhost/library', { useNewUrlParser: true, useUnifiedTopology: true });

const IndexLibrary = require('../models/index_library');

// 获取所有 tracks
router.get('/tracks', async (ctx) => {
  const tracks = await IndexLibrary.find({});
  ctx.body = tracks;
});

// Resource Service 自动注册
const registerService = async () => {
  const serviceInfo = {
    name: 'ytm-resource',
    port: 35706,
    auth: true,
    type: 'rest',
    listen: [
      { name: 'album', method: ['get', 'post', 'put', 'delete'] },
      { name: 'track', method: ['get', 'post', 'put', 'delete'] },
      { name: 'playlist', method: ['get', 'post', 'put', 'delete'] },
    ],
  };

  await fetch('http://localhost:3000/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(serviceInfo),
  });
};

app
  .use(bodyParser())
  .use(router.routes())
  .use(router.allowedMethods());

app.listen(35706, () => {
  console.log('Resource Service is running on port 35706');
  registerService();
});


// Resource Service 负责提供所有静态数据，初期测试自动注册功能。
