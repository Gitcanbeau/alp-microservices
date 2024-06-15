const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');

const packageDefinition = protoLoader.loadSync(path.join(__dirname, 'proto', 'service.proto'), {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true
});
const protoDescriptor = grpc.loadPackageDefinition(packageDefinition);
const streamService = protoDescriptor.StreamService;

function myMethod(call, callback) {
    callback(null, { message: 'Hello ' + call.request.name });
}

function startGrpcServer() {
    const server = new grpc.Server();
    server.addService(streamService.service, { myMethod: myMethod });
    const PORT = process.env.GRPC_PORT || 50053; // 使用新的端口号
    server.bindAsync(`0.0.0.0:${PORT}`, grpc.ServerCredentials.createInsecure(), (err, port) => {
        if (err) {
            console.error('Failed to bind server:', err);
        } else {
            server.start();
            console.log('gRPC server running on port 50053');
        }
    });
}

module.exports = { startGrpcServer };
// startGrpcServer();


