const Sequelize = require('sequelize');
const db = require('./config').db;
const moment = require('moment');

const sequelize = new Sequelize(db.db, db.name, db.password, {
    host: db.host,
    dialect: db.dialect,
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    },
    timezone: '+08:00',
    define: {
        schema: "yio", // 表前缀
        schemaDelimiter: '_', // 与表名的分隔符
    },
});

sequelize.authenticate().then(res => {
    console.log('数据库链接成功！')
}).catch(e => {
    console.log('数据库链接失败!' + e)
})

module.exports = {
    sequelize,
    moment
}
