const router = require('koa-router')();
const islogin = require('../../middleware/isLogin');
const Clogin = require('../../controller/login');

router.post('/api/login', async (ctx, next) => {
    try {
        let {username, password} = ctx.request.body;
        if (!username || !password) {
            throw ('参数有误!')
        }
        let result  = await Clogin.login(username,password);
        if (!result) {
            throw('账号或密码不正确!')
        }
        ctx.session.name = username;
        ctx.body = {
            code: 0,
            data: result,
            msg: '登录成功!'
        }
    } catch (e) {
        ctx.body = {
            code: -1,
            data: '',
            msg: e
        }
    }
})

router.post('/api/login/out', async (ctx, next) => {
    ctx.session.name = undefined
    if (!ctx.session.name) {
        ctx.body = {
            code: 0,
            data: '',
            msg: '退出成功!'
        }
    } else {
        ctx.body = {
            code: -1,
            data: '',
            msg: '退出失败!'
        }
    }
})

module.exports = router;