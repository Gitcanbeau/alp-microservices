const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const packageDefinition = protoLoader.loadSync(__dirname + '/proto/service.proto', {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true
});
const protoDescriptor = grpc.loadPackageDefinition(packageDefinition);
const resourceService = protoDescriptor.ResourceService;

function myMethod(call, callback) {
    callback(null, { message: 'Hello ' + call.request.name });
}

function getResource(call, callback) {
    // 实现获取资源的逻辑
    callback(null, { data: 'Resource data for id ' + call.request.id });
}

function startServer_hello() {
    const server = new grpc.Server();
    server.addService(resourceService.service, { myMethod: myMethod });
    server.bindAsync('0.0.0.0:50052', grpc.ServerCredentials.createInsecure(), () => {
        server.start();
        console.log('gRPC server running on port 50052');
    });
}

function startServer() {
    const server = new grpc.Server();
    server.addService(resourceService.service, { getResource: getResource });
    server.bindAsync('0.0.0.0:50051', grpc.ServerCredentials.createInsecure(), () => {
        server.start();
        console.log('gRPC server running on port 50051');
    });
}

startServer();
