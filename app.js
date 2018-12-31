const koa = require('koa');
const serve = require('koa-static');
const session = require('koa-session');
const bodyParams = require('koa-bodyparser');
const config = require('./com/config');
const orders = require('./api/orders');
const pay = require('./api/addons/pay');
const user = require('./api/user');
const app = new koa();
const port = 3000;

app.proxy = true; // 如果Nginx转发的请务必设置，否则拿不到ip
app.keys = ['some secret hurr']; // cookie加密字符串
app.use(session(config.sessionConfig,app));
app.use(bodyParams());
app.use(orders.routes());
app.use(pay.routes());
app.use(user.routes());
app.use(serve(__dirname + '/www'));

app.listen(port, (err) => {
    if (err) {throw err}
    console.log('服务器启动成功!http://localhost:' + port);
});
