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
const gatewayService = protoDescriptor.GatewayService;

function myMethod(call, callback) {
    callback(null, { message: 'Hello ' + call.request.name });
}

function startServer() {
    const server = new grpc.Server();
    server.addService(gatewayService.service, { myMethod: myMethod });
    server.bindAsync('0.0.0.0:50051', grpc.ServerCredentials.createInsecure(), () => {
        server.start();
        console.log('gRPC server running on port 50051');
    });
}

startServer();
