require('dotenv').config();// 确保尽早加载环境变量
const Koa = require('koa');
const bodyParser = require('koa-bodyparser');
const mongoose = require('mongoose');
// const fetch = require('node-fetch'); // 确保引入 fetch
const metadataRouter = require('./router');
const { startGrpcServer } = require('./grpcServer');
const { sendMessage } = require('./kafkaClient'); // Import KafkaClient

const app = new Koa();

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.log('MongoDB connection error:', err));

// Function to register the service
const registerService = async () => {
  const serviceInfo = {
    name: 'ytm-library',
    port: process.env.PORT || 35708,
    auth: true,
    type: 'rest',
    listen: [
      { name: 'library', method: ['get', 'post'] },
    ],
  };

  try {
    // 使用动态导入引入 node-fetch
    const fetch = (await import('node-fetch')).default;
    const response = await fetch('http://localhost:3000/register-service', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(serviceInfo),
    });
    if (!response.ok) {
      throw new Error('Failed to register service');
    }
    console.log('Service registered successfully in ytm-library');
  } catch (error) {
    console.error('Error registering service in ytm-library:', error);
  }
};


app
  .use(bodyParser())
  .use(metadataRouter.routes())
  .use(metadataRouter.allowedMethods());

const PORT = process.env.PORT || 35708;
app.listen(PORT, () => {
  console.log(`Metadata Service is running on port ${PORT}`);
  registerService();

  startGrpcServer();

  //考虑到通常情况下希望在服务启动后再发送 Kafka 消息
  sendMessage('library-topic', { message: 'Library Service has started' });
});

// Example usage of KafkaClient to send a message
// sendMessage('library-topic', { message: 'Library Service has started' });

// 放在 app.listen 之外适用场景：
// 初始化操作：在服务启动之前需要执行一些初始化操作。例如，向 Kafka 发送一条消息通知其他服务此服务已启动。
// 独立于服务器启动的操作：某些 Kafka 操作与服务器端口监听无关，可以在服务器启动之前执行。
// 放在 app.listen 之内适用场景：
// 确保服务器成功启动：需要确保服务器已成功启动并正在监听端口后再执行某些操作。这样可以确保服务器确实已准备好处理请求。
// 延迟初始化操作：某些操作需要在服务器完全启动后再执行，比如服务注册或健康检查等。