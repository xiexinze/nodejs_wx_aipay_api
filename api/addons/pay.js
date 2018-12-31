const router = require('koa-router')()
const md5 = require('../../com/tools').md5
const secretkey = require('../../com/config').secretkey
const Corders = require('../../controller/orders');
const request = require('request');

/**
 * 
 * @api {get} /addons/pay/api/setting 验证客户端
 * @apiName 验证客户端
 * @apiGroup android
 * @apiVersion  1.0.0
 * 
 * 
 * @apiParam  {String} apiurl 客户端根据收款地址自动处理 格式=> http(s)://localhost/addons/pay/ (注意：后面需要"/"结尾)
 * @apiParam  {String} sign 签名密匙，config.js里面的 secretkey 值
 * @apiSuccess (200) {Object} data 无
 * 
 */

const errSign = (msg) => { // 客户端错误码
    return {
        code: 0,
        msg: msg,
        data: '',
        url: '',
        wait: 3
    }
}
/**
 * 验证客户端密匙是否正确
 */
router.get('/addons/pay/api/setting', async (ctx, next) => {
    try {
        let params = ctx.query;
        if (!params.sign && !params.apiurl) {
            ctx.statusCode = 404;
            return false;
        }
        // 验证签名
        if(params.sign != md5(md5(params.apiurl) + secretkey)) {
           throw('密匙不正确!');
        } else {
            ctx.body = {
                code: 1,
                msg: '配置成功!',
                data: '',
                url: '',
                wait: 3
            }
        }
    }catch (e) {
        errSign(e)
    }
})


/**
 * 
 * @api {get} /addons/pay/api/notif 安卓检测支付通知
 * @apiName 安卓App说明
 * @apiGroup android
 * @apiVersion  1.1.1
 * @apiDescription 注意，此接口是安卓检测支付通知使用，但是里面有支付成功后的通知，如有支付通知有问题请再次查验!
 * 
 */
router.get('/addons/pay/api/notify', async (ctx, next) => {
    try{
        let {sign, price, type,} = ctx.query;
        console.log(sign,price,type)
        if (!sign && !price && !type) {
            ctx.statusCode = 404;
            return false;
        }
        // 更新处理过期订单 
        await Corders.up_order_all_status();
        // 验证签名 签名加密方法 md5(md5(params.price + params.type) + secretkey)
        if (sign != md5(md5(price + type) + secretkey)) {
            ctx.body = errSign('签名错误');
        } else {
            let changePayStatus = await Corders.up_order_status(price, type);
            if (changePayStatus.join() == 1) {
                // 通知回调
                // 注意这里的签名方法为 md5(md5(订单号的前三位+secretkey))
                let payData = await Corders.find_url(type, price);
                let orderNo = payData.dataValues.order_id.substring(0,3);
                let url = payData.dataValues.redirect_url + '?order_id=' + payData.dataValues.order_id + '&extension=' + payData.dataValues.extension + '&sgin=' + md5(md5(orderNo + secretkey));
                request.get(url,(error, response, body) => {
                    if(error) console.log('支付通知失败,请检查redirect_url是否正确!' + url)
                })
            } else {
                console.log('非有效期订单，不予处理!')
            }
            if (!changePayStatus) {
                msg = type == 'wechat' ? '微信支付收款处理成功，订单未处理!' : '支付宝收款处理成功，订单未处理!'
            } else {
                msg = type == 'wechat' ? '微信支付收款处理成功' : '支付宝收款处理成功'
            }
            ctx.body = {
                code: 1,
                msg: msg,
                data: '',
                url: '/aip/notify.html',
                wait: 3
            }
        }
    } catch (e) {
        ctx.body = errSign(e)
    }
})
module.exports = router