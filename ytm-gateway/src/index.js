require('dotenv').config();
const Koa = require('koa');
const mongoose = require('mongoose');
const bodyParser = require('koa-bodyparser');
// const router = require('./routes');
const authRouter = require('./routes/apiRoutes');
const registerRouter = require('./routes/serviceRegister'); // 添加这一行

const app = new Koa();

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.log('MongoDB connection error:', err));

app
  .use(bodyParser())
  .use(authRouter.routes()) // 使用合并后的路由
  .use(authRouter.allowedMethods())
  .use(registerRouter.routes()) // 添加这一行
  .use(registerRouter.allowedMethods()); // 添加这一行

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Gateway Service is running on port ${PORT}`);
});

