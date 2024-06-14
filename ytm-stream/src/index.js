require('dotenv').config(); // 加载环境变量，一定要最早导入。
const Koa = require('koa');
const router = require('./routes');
const fetch = require('node-fetch');


const app = new Koa();

const registerService = async () => {
  const serviceInfo = {
    name: 'ytm-stream',
    port: process.env.PORT || 35707,
    auth: true,
    type: 'rest',
    listen: [
      { name: 'stream', method: ['get'] },
    ],
  };

  try {
    const response = await fetch('http://localhost:3000/register-service', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(serviceInfo),
    });
    if (!response.ok) {
      throw new Error('Failed to register service');
    }
    console.log('Service registered successfully');
  } catch (error) {
    console.error('Error registering service:', error);
  }
};

app
  .use(router.routes())
  .use(router.allowedMethods());

const PORT = process.env.PORT || 35707;
app.listen(PORT, () => {
  console.log(`Stream Service is running on port ${PORT}`);
  registerService();
});

