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

function startServer() {
    const server = new grpc.Server();
    server.addService(resourceService.service, { myMethod: myMethod });
    server.bindAsync('0.0.0.0:50052', grpc.ServerCredentials.createInsecure(), () => {
        server.start();
        console.log('gRPC server running on port 50052');
    });
}

startServer();
