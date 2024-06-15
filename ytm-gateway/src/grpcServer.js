const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');

// 加载 service.proto 文件
const packageDefinition = protoLoader.loadSync(path.join(__dirname, 'proto', 'service.proto'), {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true
});
const protoDescriptor = grpc.loadPackageDefinition(packageDefinition);
const gatewayService = protoDescriptor.GatewayService;

// 定义 gRPC 方法
function myMethod(call, callback) {
    callback(null, { message: 'Hello ' + call.request.name });
}

// 启动 gRPC 服务器
function startGrpcServer() {
    const server = new grpc.Server();
    server.addService(gatewayService.service, { myMethod: myMethod });
    server.bindAsync('0.0.0.0:50051', grpc.ServerCredentials.createInsecure(), (err, port) => {
        if (err) {
            console.error('Failed to bind server:', err);
        } else {
            server.start();
            console.log('gRPC server running on port', port);
        }
    });
}

module.exports = { startGrpcServer };
// startGrpcServer();

