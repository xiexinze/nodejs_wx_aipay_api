# 文档说明

## nodeJS版个人支付免签系统 Api 版本

第一版地址： https://github.com/yioMe/node_wx_alipay_personalPay

第一个版本有些杂乱，附带了一些不需要的功能。


nodeJS版个人支付免签系统 Api 版本，丰富的代码注释和Api文档，让你轻松傻瓜式接入你的支付系统，依赖更少，删除了和支付不相关的功能，只需要两张表（一张用户表，一张订单表),也不需要上传n张二维码，可同时被接入多个系统，并且完全独立;


支付Demo地址: http://pay.yio.me/#/goods/DwnNGCW4VLk1CjemIiUqf

文档地址： http://dev.yio.me/api/a/index.html 

## 初始化

    1. 首先你需要在服务器中安装 nodeJS mysql 环境；

    2. 将项目文件下载到你的服务器;

    3. 修改 com/config.js 文件里面的 db（mysql数据库）、secretkey（签名密匙）、PayQr（收款二维码） 信息；

    4. 打开命令终端(cmd/终端),在项目根目录执行 npm install 或者 npm i, 安装好所有依赖;

    5. 开启程序，在项目根目录中执行 node app.js ,看到输出，服务器启动成功，程序开启完成；

    6. 正式使用的时候，请使用 pm2 启动本程序;
    
        6.1. 安装 pm2 输入命令  npm i -g pm2  

        6.2. 启动 pm2 start ./app.js --watch 


## 引导

    1. 安装完成之后，根据提示打开启动的url地址即可看到后台页面，默认账号密码是admin；

    2. 此项目是 Api版本，如果你想要集成功能的请访问第一版地址： https://github.com/yioMe/node_wx_alipay_personalPay


## 新的文档

    你可以通过访问 http://dev.yio.me/api/a/index.html  或者打开项目中的 DocApi目录查看如何接入支付系统和配置客户端;

    你需要关注 roder - 创建支付订单，这里提供完全的支付通知，可在用户完成支付的同时通知到你的服务；


![现在的后台][1]
是的，现在的后台只提供支付订单查询，一切无关的功能全部去除,后台能去掉吗?这个还不行，有个支付页面需要依赖它，你可以不访问这个后台，它也没有任何危害的权限；


[1]: http://static.yio.me/1546271621331.png

## 后话

    有人问有没有手续费，是不是二清，没有手续费，直接到你账上了，没有使用的我任何服务，你想做什么业务都可以，并没有人去审核你的业务!


