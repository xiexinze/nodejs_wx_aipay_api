const router = require('koa-router')();
const Corders = require('../../controller/orders');
const md5 = require('../../com/tools').md5;
const secretkey = require('../../com/config').secretkey;
const pay_qr = require('../../com/config').PayQr;
const isLogin = require('../../middleware/isLogin');

/**
 * 
 * @api {post} /api/order 创建支付订单
 * @apiName 创建支付订单
 * @apiGroup order
 * @apiVersion  1.0.0
 * @apiDescription 请勿前端直接调用该接口，请妥善保存secretkey!!!
 * 
 * @apiParam  {String} order_id 外部订单id，请确保该参数唯一性
 * @apiParam  {Float} order_price 外部订单金额，保留两位小数
 * @apiParam  {String} pay_format 返回的支付格式 json 和 html 默认 json 注（html返回的是支付url页面，请拼接上域名后返回给前台，列如返回 /#/pay/111， 请加上本系统域名//#/pay/111进行访问）
 * @apiParam  {String} pay_type 支付方式 wechat 和 alipay 默认 wechat
 * @apiParam  {String} [extension] 扩展信息，支付成功后原样返回
 * @apiParam  {String} redirect_url 支付成功服务器回调地址包含 http(s)://，当系统检测到订单已支付会向这个url地址推送”一次“Get请求！包含三个参数order_id 、extension 和 sgin 这里的sgin默认加密方式为 md5(md5(订单号的前三位+secretkey)) pay.js 87行，请根据自己需要进行修改；
 * @apiParam  {String} sign 签名，签名加密方法 md5(md5(order_price + pay_type) + secretkey)
 * 
 * @apiSuccess (200) {Number} code 0成功 -1失败
 * @apiSuccess (200) {Object} data 
 * @apiSuccess (200) {String} msg 提示信息 
 * 
 */

router.post('/api/order', async (ctx, next) => {
    try {
        // 验证密匙是否正确
        let { order_id, order_price, pay_format, pay_type, extension, sign, redirect_url} = ctx.request.body;
        pay_format ? pay_format : "json";
        pay_type ? pay_type : "wechat";

        if(!(order_id && order_price && sign)) {
            throw('参数不完整!');
        } else if (parseFloat(order_price) <= 0) {
            throw('金额不能小于等于0!')
        } else if (!redirect_url){
            throw('redirect_url参数不能为空!')
        }

        if (sign != md5(md5(order_id + order_price) + secretkey)) {
           throw('签名错误');
        }
        
        // 更新处理过期订单 
        await Corders.up_order_all_status();

        let _pay_price = [] // 可以使用的金额数组

        // 查询订单金额的支付通道是否被占用,返回可以使用的金额
        let getNewPrice = async (pay_type, order_price) => {
            let priceInterval = 10, // 价格区间 单位为 0.01 列如商品价格1元 会在1元的基础上包含1元 10 * 0.01 （1.00 -- 0.90）随机立减
                tempData = [], // 临时存放查出来的订单数据
                order_prices = (order_price * 1).toFixed(2),
                index = 0;
            tempData = await Corders.find_price(pay_type, order_prices)
            if (tempData.length == 0) {
                _pay_price.push(order_prices)
            } else { 
                for (let i = 0; i < priceInterval; i++) {
                    if (!(order_prices -= 0.01) <= 0.01) {
                        order_prices = order_prices.toFixed(2)
                        tempData = await Corders.find_price(pay_type, order_prices)
                        if (tempData.length == 0) {
                            _pay_price.push(order_prices)
                        } else {
                            index++
                        }
                    }
                }
            }
            if (index == priceInterval) { // 此金额的二维码没有可使用的
                throw('系统繁忙，请1-3分钟后重试!')
            }
            
        }

        await getNewPrice(pay_type, order_price)

        // 使用随机金额
        let index = Math.floor((Math.random()*_pay_price.length));
        pay_price = _pay_price[index]

        // 创建新的订单
        let newOrderid = await Corders.add_order({
            order_id,
            order_price,
            pay_format: pay_format == 'html' ? 'html' : 'json',
            pay_type,
            pay_price,
            extension: extension ? extension : '',
            sign,
            pay_qr: pay_type != 'wechat' ? pay_qr.ali : pay_qr.wx,
            redirect_url
        })

        if (pay_format == 'html') {
            ctx.body = {
                code: 0,
                data: '/#/pay/' + order_id,
                msg: '创建订单成功!'
            }
            return false
        }
        ctx.body = {
            code: 0,
            data: newOrderid.dataValues,
            msg: '创建订单成功!'
        }
        
    } catch(e) {
        ctx.body = {
            code: -1,
            data: '',
            msg: e,
        }
    }
})

// 后台查看订单列表，搜索等功能
router.get('/api/getfindorder', isLogin, async (ctx, next) => {
    try {
        // 必要的参数 page num 非必要的参数 where 
        let {page, num, pay_type, status:pay_status, order_id} = ctx.query
        if (parseInt(page) != page && parseInt(num) != num) {
            throw ('参数有误!')
        }
        
        let where = {}
        if (pay_type != '') {
            where.pay_type = pay_type 
        }
        if (pay_status != '') {
            where.pay_status = pay_status
        }
        if (order_id != '') {
            where.order_id = order_id
        }
        
        let result = await Corders.find_all(page, num, where);
        let sumPrice = await Corders.find_pay_count();
        let orderNum = await Corders.find_order_num();
        result.sumPrice = sumPrice;
        result.sumOrder = orderNum;
        if (!result) throw('没有数据!')
        ctx.body = {
            code: 0,
            data: result,
            msg: ''
        } 
    } catch (e) {
        ctx.body = {
            code: -1,
            data: '',
            msg: e
        }
    }
})

// 返回html结构使用的方法

router.get('/api/getorderid', async (ctx, next) => {
    try {
        let {order_id} = ctx.query;
        if (order_id == '') throw ('订单号有误!');
        let result = await Corders.find_one_orderid(order_id);
        if (!result) throw('订单不存在!')
        if (result.pay_status == '已过期') throw ('订单已过期!')
        let exire = +new Date(result.createdAt) - ((+new Date()) - 5 * 60 * 1000)
        ctx.body = {
            code: 0,
            data: result,
            time: exire,
            msg: ''
        }
    } catch (e) {
        ctx.body = {
            code: -1,
            data: '',
            msg: e
        }
    }
})

// 轮询html支付页面支付结果
router.get('/api/orderstatus', async (ctx, next) => {
    try{
        let {order_id} = ctx.query
        if (order_id == '') throw('订单号错误!')
        let result = await Corders.find_one_orderid(order_id);
        if (!result) throw('订单不存在!')
        if (result.pay_status == '已过期') throw ('订单已过期!')
        ctx.body = {
            code: 0,
            data: result,
            msg: ''
        }
    } catch (e) {
        ctx.body = {
            code: -1,
            data: '',
            msg: e
        }
    }
})

module.exports = router;