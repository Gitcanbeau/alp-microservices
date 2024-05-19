const Koa = require('koa');
const router = require('./routes');

const app = new Koa();

const registerService = async () => {
  const serviceInfo = {
    name: 'ytm-stream',
    port: 35707,
    auth: true,
    type: 'rest',
    listen: [
      { name: 'stream', method: ['get'] },
    ],
  };

  await fetch('http://localhost:3000/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(serviceInfo),
  });
};

app
  .use(router.routes())
  .use(router.allowedMethods());

const PORT = process.env.PORT || 35707;
app.listen(PORT, () => {
  console.log(`Stream Service is running on port ${PORT}`);
  registerService();
});
