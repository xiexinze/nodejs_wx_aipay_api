const Sequelize = require('sequelize');
const {sequelize, moment} = require('../../com/bd');
const md5 = require('../../com/tools').md5;
const salt = 'yio'; // 用来加密下密码，注：移动是单用户 加密方式 md5(md5(pwd) + salt)

const admin = sequelize.define('admin', {
    username: {
        type: Sequelize.STRING(20)
    },
    password: {
        type: Sequelize.STRING(50)
    },
    last_login: {
        type: Sequelize.STRING(50)
    },
    createdAt: {
        type: Sequelize.DATE,
        get() {
            return moment(this.getDataValue('createdAt')).format('YYYY-MM-DD HH:mm:ss');
        }
    },
    updatedAt: {
        type: Sequelize.DATE,
        get() {
            return moment(this.getDataValue('updatedAt')).format('YYYY-MM-DD HH:mm:ss');
        }
    }
},{
    paraonid: true
})

async function init () {
    let adminInfo = await admin.findOne({where:{username: 'admin'}})
    if (!adminInfo) {
        admin.create({
            username: 'admin',
            password: md5(md5('admin') + salt)
        })
        console.log('您的初始账号密码为admin!')
    }
}
admin.sync({force: false})
    .then(async () => {
        console.log('创建admin表成功!')
        init()
    })
    .catch(e => {
        console.log('创建admin表失败!')
    })

admin.login = async (name,password) => {
    await admin.update({last_login: +new Date()},{where: {username:name}});
    return admin.findOne({
        where: {
            username: name,
            password: md5(md5(password) + salt)
        },
        attributes: ['id', 'username']
    })
}

module.exports = admin;
