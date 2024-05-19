const Koa = require('koa');
const bodyParser = require('koa-bodyparser');
// const router = require('./routes');
const router = require('./apiRoutes');

const app = new Koa();

// 连接 MongoDB
mongoose.connect('mongodb://localhost/library', { useNewUrlParser: true, useUnifiedTopology: true });

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

const PORT = process.env.PORT || 35706;
app.listen(PORT, () => {
  console.log(`Resource Service is running on port ${PORT}`);
  registerService();
});
