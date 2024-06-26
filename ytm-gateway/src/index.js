require('dotenv').config();
const Koa = require('koa');
const mongoose = require('mongoose');
const bodyParser = require('koa-bodyparser');
// const router = require('./routes');
const authRouter = require('./routes/apiRoutes');
const registerRouter = require('./routes/serviceRegister'); // 添加这一行

const { startGrpcServer } = require('./grpcServer');
const kafkaClient = require('./kafkaClient');

const app = new Koa();

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.log('MongoDB connection error:', err));

app
  .use(bodyParser())
  .use(authRouter.routes()) // 使用合并后的路由
  .use(authRouter.allowedMethods())
  .use(registerRouter.routes()) // 添加这一行
  .use(registerRouter.allowedMethods()); // 添加这一行

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Gateway Service is running on port ${PORT}`);
  startGrpcServer();

  // Kafka 消息生产者示例
  kafkaClient.producer.on('ready', () => {
    console.log('Kafka Producer is ready.');
    kafkaClient.producer.send([
      { topic: 'gateway-topic', messages: JSON.stringify({ msg: 'Hello Kafka' }) }
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

