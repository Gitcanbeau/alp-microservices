require('dotenv').config(); // 加载环境变量，dotenv 的加载应该是最早的一步。
const Koa = require('koa');
const bodyParser = require('koa-bodyparser');
const mongoose = require('mongoose'); // 添加这一行
const fetch = require('node-fetch'); // 添加这一行
const router = require('./routes/routes');
// const router = require('./routes/apiRoutes');// 直接引入 apiRoutes.js 也是可以的
const requestFromGateWayRouter = require('./routes/requestFromGateWay'); // 引入 users 路由


const { startGrpcServer } = require('./grpcServer');
const kafkaClient = require('./kafkaClient');


// 是否有必要保留 routes.js ？
// 保留 routes.js:
// 保留 routes.js 文件有助于将所有路由配置集中到一个文件中，使 index.js 文件更加简洁。
// 如果将来有更多的路由或中间件需要添加，可以在 routes.js 中进行统一管理。

// 移除 routes.js 并直接使用 apiRoutes.js:
// 如果项目简单且没有太多路由配置需求，可以直接在 index.js 中使用 apiRoutes.js，减少文件层次。
// 建议
// 为了保持代码清晰和可维护性，我建议保留 routes.js 文件。这样可以将所有路由配置集中管理，避免在 index.js 文件中出现过多的路由配置细节。

const app = new Koa();

// 连接 MongoDB
// mongoose.connect('mongodb://localhost/library', { useNewUrlParser: true, useUnifiedTopology: true });

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.log('MongoDB connection error:', err));

// Resource Service 自动注册
const registerService = async () => {
  const serviceInfo = {
    name: 'ytm-resource',
    port: process.env.PORT || 35706,
    auth: true,
    type: 'rest',
    listen: [
      { name: 'album', method: ['get', 'post', 'put', 'delete'] },
      { name: 'track', method: ['get', 'post', 'put', 'delete'] },
      { name: 'playlist', method: ['get', 'post', 'put', 'delete'] },
    ],
  };

  // await fetch('http://localhost:3000/register', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(serviceInfo),
  // });
  
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
  .use(bodyParser())
  .use(router.routes())
  .use(router.allowedMethods())
  .use(requestFromGateWayRouter.routes()) // 使用 users 路由
  .use(requestFromGateWayRouter.allowedMethods());

const PORT = process.env.PORT || 35706;
app.listen(PORT, () => {
  console.log(`Resource Service is running on port ${PORT}`);
  registerService();

  startGrpcServer();

  // Kafka 消息生产者示例
  kafkaClient.producer.on('ready', () => {
    console.log('Kafka Producer is ready.');
    kafkaClient.producer.send([
      { topic: 'resource-topic', messages: JSON.stringify({ msg: 'Resource Service Hello Kafka' }) }
    ], (err, data) => {
      if (err) {
        console.error('Kafka Producer send error:', err);
      } else {
        console.log('Kafka message sent:', data);
      }
    });
  });

  // Kafka 消息消费者示例
  kafkaClient.consumer.on('message', (message) => {
    console.log('Kafka Consumer message:', message.value);
  });

  kafkaClient.consumer.on('error', (err) => {
    console.error('Kafka Consumer error:', err);
  });
  
});


// ytm-gateway 主要处理客户端请求、认证和授权。
// ytm-resource 管理核心数据，包括用户数据。
// ytm-stream 处理流媒体相关的逻辑。
// 通过将认证逻辑放在 ytm-gateway，并在 ytm-resource 中管理用户数据，
// 可以确保各个微服务的职责清晰，并且通过服务之间的调用实现功能集成。这样不仅提升了系统的可维护性，还增强了安全性和扩展性。