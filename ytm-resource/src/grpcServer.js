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
const resourceService = protoDescriptor.ResourceService;

// 定义 gRPC 方法
function getResource(call, callback) {
    // 实现获取资源的逻辑
    
    const resourceId = call.request.id;
    // 假设我们有一些逻辑获取资源数据
    const resourceData = `Resource data for id ${resourceId}`;
    callback(null, { data: 'Resource data for id ' + call.request.id });
}

// 启动 gRPC 服务器
function startServer() {
    const server = new grpc.Server();
    server.addService(resourceService.service, { getResource: getResource });
    server.bindAsync('0.0.0.0:50051', grpc.ServerCredentials.createInsecure(), (err, port) => {
        if (err) {
            console.error('Failed to bind server:', err);
        } else {
            server.start();
            console.log('gRPC server running on port', port);
        }
    });
}

startServer();

