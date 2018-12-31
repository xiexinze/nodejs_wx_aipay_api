module.exports = {
    db: {
        host: '127.0.0.1', // 数据库地址
        db: 'bd', // 数据库名称
        name: 'dn', // 数据库账号
        password: 'db', // 数据库密码
        dialect: 'mysql', // 数据库类型
    },
    sessionConfig: {
        key: 'koa:sess', /** (string) cookie key (default is koa:sess) */
        /** (number || 'session') maxAge in ms (default is 1 days) */
        /** 'session' will result in a cookie that expires when session/browser is closed */
        /** Warning: If a session cookie is stolen, this cookie will never expire */
        maxAge: 86400000,
        overwrite: true, /** (boolean) can overwrite or not (default true) */
        httpOnly: true, /** (boolean) httpOnly or not (default true) */
        signed: true, /** (boolean) signed or not (default true) */
        rolling: false, /** (boolean) Force a session identifier cookie to be set on every response. The expiration is reset to the original maxAge, resetting the expiration countdown. (default is false) */
        renew: false, /** (boolean) renew session when session is nearly expired, so we can always keep user logged in. (default is false)*/
    },
    secretkey: '123456', // 签名
    PayQr: { // 配置收款二维码，此收款二维码没有金额，请通过https://cli.im/deqr，将识别出来的url地址放入下面配置项
        wx: 'wxp://f2f00o7Dku6hnuDNFUHXjbbSrzzemPq4f7X2', // 微信
        ali: 'https://qr.alipay.com/fkx07981bfsdkktx1xgauac', // 支付宝
    }
}