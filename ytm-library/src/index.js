require('dotenv').config();
const Koa = require('koa');
const bodyParser = require('koa-bodyparser');
const mongoose = require('mongoose');
const metadataRouter = require('./router');
const { startGrpcServer } = require('./services/grpcServer');

const app = new Koa();

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.log('MongoDB connection error:', err));

app
  .use(bodyParser())
  .use(metadataRouter.routes())
  .use(metadataRouter.allowedMethods());

const PORT = process.env.PORT || 35708;
app.listen(PORT, () => {
  console.log(`Metadata Service is running on port ${PORT}`);
  startGrpcServer();
});
