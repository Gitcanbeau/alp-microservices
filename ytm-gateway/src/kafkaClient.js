// 导入 Kafka 相关模块
const kafka = require('kafka-node');
const Producer = kafka.Producer;
const Consumer = kafka.Consumer;
const client = new kafka.KafkaClient({ kafkaHost: 'localhost:9092' });

// 创建 Kafka 生产者实例
const producer = new Producer(client);
producer.on('ready', function() {
    console.log('Kafka Producer in ytm-gateway is ready.');
});
producer.on('error', function(err) {
    console.error('Kafka Producer in ytm-gateway error: ', err);
});

// 创建 Kafka 消费者实例，订阅 'gateway-topic' 主题
const consumer = new Consumer(
    client,
    [{ topic: 'gateway-topic', partition: 0 }],
    { autoCommit: false }
);

consumer.on('message', function(message) {
    console.log('Kafka Consumer in ytm-gateway message: ', message);
});

consumer.on('error', function(err) {
    console.error('Kafka Consumer in ytm-gateway error: ', err);
});

// 导出生产者和消费者实例
module.exports = { producer, consumer };
