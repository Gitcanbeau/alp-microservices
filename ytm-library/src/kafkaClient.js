const kafka = require('kafka-node');
require('dotenv').config();

const client = new kafka.KafkaClient({ kafkaHost: process.env.KAFKA_BROKER });
const producer = new kafka.Producer(client);

producer.on('ready', () => {
  console.log('Kafka Producer is connected and ready.');
});

producer.on('error', (err) => {
  console.error('Kafka Producer error:', err);
});

const sendMessage = (topic, message) => {
  const payloads = [{ topic, messages: JSON.stringify(message) }];
  producer.send(payloads, (err, data) => {
    if (err) {
      console.error('Error sending message to Kafka:', err);
    } else {
      console.log('Message sent to Kafka:', data);
    }
  });
};

module.exports = { sendMessage };

// 第二种写法：

// 功能：
// 仅创建了生产者。
// 提供了一个 sendMessage 函数，用于发送消息到指定的主题。
// 适用场景：
// 当一个微服务只需要发送消息而不需要接收消息时使用。
// 例如，ytm-library 服务可能只是发送消息到 Kafka，而不需要处理从 Kafka 接收到的消息。

