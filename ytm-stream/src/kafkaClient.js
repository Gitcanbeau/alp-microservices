const kafka = require('kafka-node');
const Producer = kafka.Producer;
const Consumer = kafka.Consumer;
const client = new kafka.KafkaClient({ kafkaHost: 'localhost:9092' });

// 创建 Kafka 生产者实例
const producer = new Producer(client);
producer.on('ready', function() {
    console.log('Kafka Producer in ytm-stream is ready.');
});
producer.on('error', function(err) {
    console.error('Kafka Producer in ytm-stream error: ', err);
});

// 创建 Kafka 消费者实例，订阅 'stream-topic' 主题
const consumer = new Consumer(
    client,
    [{ topic: 'stream-topic', partition: 0 }],
    { autoCommit: false }
);

consumer.on('message', function(message) {
    console.log('Kafka Consumer in ytm-stream message: ', message);
});

consumer.on('error', function(err) {
    console.error('Kafka Consumer in ytm-stream error: ', err);
});

module.exports = { producer, consumer };

// 第一种写法：

// 功能：
// 创建了生产者和消费者。
// 消费者订阅了特定的主题（stream-topic）。
// 可以同时发送和接收 Kafka 消息。
// 适用场景：
// 当一个微服务需要同时发送和接收 Kafka 消息时使用。
// 例如，ytm-stream 服务可能需要从其他服务接收消息并处理，同时需要将处理结果发送出去。


