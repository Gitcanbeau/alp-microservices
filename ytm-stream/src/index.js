require('dotenv').config(); // 加载环境变量，一定要最早导入。
const Koa = require('koa');
const router = require('./routes');
const fetch = require('node-fetch');

const kafkaClient = require('./kafkaClient'); // 导入 kafkaClient
const { startGrpcServer } = require('./grpcServer'); // 导入 grpcServer


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

