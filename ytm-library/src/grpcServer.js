const path = require('path');
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const { libraryLoad } = require('./services');

const PROTO_PATH = path.join(__dirname, 'proto', 'metadata.proto');

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const metadataProto = grpc.loadPackageDefinition(packageDefinition).metadata;

const server = new grpc.Server();

server.addService(metadataProto.MetadataService.service, {
  loadLibrary: async (call, callback) => {
    const { path } = call.request;
    try {
      await libraryLoad(path);
      callback(null, { message: 'Library loaded successfully' });
    } catch (error) {
      callback(error);
    }
  },
});

// const startGrpcServer = () => {
//   const grpcServerAddress = process.env.GRPC_SERVER || 'localhost:50051';
//   server.bindAsync(grpcServerAddress, grpc.ServerCredentials.createInsecure(), (err, port) => {
//     if (err) {
//       console.error('Error starting gRPC server:', err);
//       return;
//     }
//     console.log(`gRPC server running at ${grpcServerAddress}`);
//     server.start();
//   });
// };

// // 启动 gRPC 服务器
const startGrpcServer = () => {
  const PORT = process.env.GRPC_PORT || 50054; // 使用新的端口号
  server.bindAsync(`0.0.0.0:${PORT}`, grpc.ServerCredentials.createInsecure(), (err, port) => {
    if (err) {
      console.error('Error starting gRPC server:', err);
      return;
    }
    console.log(`gRPC server running on port ${PORT}`);
    server.start();
  });
};

module.exports = { startGrpcServer };


