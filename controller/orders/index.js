const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const {sequelize, moment} = require('../../com/bd');

/**
 * 支付订单表
 */

const orders = sequelize.define('order', {
    order_id: {
        type: Sequelize.STRING()
    },
    order_price: {
        type: Sequelize.DECIMAL(8,2)
    },
    pay_price: {
        type: Sequelize.DECIMAL(8,2)
    },
    pay_status: {
        type: Sequelize.ENUM('未支付','已支付','已过期'),
        defaultValue: '未支付'
    },
    pay_type: {
        type: Sequelize.ENUM('wechat','alipay'),
        defaultValue: 'wechat'
    },
    pay_format: {
        type: Sequelize.ENUM('json','html'),
        defaultValue: 'json'
    }, 
    pay_qr: {
        type: Sequelize.STRING()
    },
    redirect_url: {
        type: Sequelize.STRING()
    },
    extension: {
        type: Sequelize.STRING()
    },
    createdAt: {
        type: Sequelize.DATE(),
        get() {
            return moment(this.getDataValue('createdAt')).format('YYYY-MM-DD HH:mm:ss');
        }
    },
    updatedAt: {
        type: Sequelize.DATE(),
        get() {
            return moment(this.getDataValue('updatedAt')).format('YYYY-MM-DD HH:mm:ss');
        }
    }
}, {
    paranoid: true,

})

orders.sync({force: false})
    .then(() => {
        console.log('创建order表成功!')
    })
    .catch(e => {
        console.log('创建order表失败!' + e)
    })

// 添加支付订单
orders.add_order = async (data) => {
    return orders.create(data)
}

// 处理支付订单状态
orders.up_order_all_status = async (order_id = null) => {
    // 处理下超时未支付的订单设置为已过期
    await orders.update({
        'pay_status': "已过期",
    }, {
        where: {
            createdAt: {
                [Op.lt]: +new Date() -5 * 60 * 1000
            },
            pay_status: "未支付"
        }
    })

}
// 更新订单id为已支付
orders.up_order_status = async (pay_price, pay_type) => {
    return orders.update({
        pay_status: "已支付",
    },{
        where: {
            pay_price: pay_price,
            pay_type: pay_type,
            pay_status: "未支付",
            createdAt: {
                [Op.gt]: +new Date() -5 * 60 * 1000
            }
        }
    })
}
    

// 根据金额和支付方式判断当前金额是否可以使用
orders.find_price = async (pay_type,pay_price) => {
    return orders.findAll({
        where: {
            pay_type,
            pay_price,
            pay_status: "未支付",
            createdAt: {
                [Op.gt]: +new Date() -5 * 60 * 1000
            }
        }
    })
}

// 查询支付成功的回调地址
orders.find_url = async (pay_type,pay_price) => {
    return orders.findOne({
        where: {
            pay_type,
            pay_price,
            pay_status: "已支付",
            createdAt: {
                [Op.gt]: +new Date() -5 * 60 * 1000
            }
        }
    })
}

orders.find_all = async (page,num,where) => {
    return orders.findAndCount({
        offset: page * num - num,
        limit: parseInt(num),
        where: where,
    })
}

// 已支付订单金额
orders.find_pay_count = async () => {
    return orders.sum('pay_price',{
        where: {
            pay_status: '已支付'
        }
    })
}

// 所有订单数
orders.find_order_num = async () => {
    return orders.count();
}

// 查询订单信息
orders.find_one_orderid = async (order_id) => {
    return orders.findOne({
        where: {
            order_id
        }
    })
}
module.exports = orders;