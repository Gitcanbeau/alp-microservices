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
const streamService = protoDescriptor.StreamService;

function myMethod(call, callback) {
    callback(null, { message: 'Hello ' + call.request.name });
}

function startServer() {
    const server = new grpc.Server();
    server.addService(streamService.service, { myMethod: myMethod });
    server.bindAsync('0.0.0.0:50053', grpc.ServerCredentials.createInsecure(), () => {
        server.start();
        console.log('gRPC server running on port 50053');
    });
}

startServer();
