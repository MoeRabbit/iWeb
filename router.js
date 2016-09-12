var Index = require('./app/controllers/index');
var User = require('./app/controllers/user');

module.exports = function(app){
    app.use(function(req, res, next) {
        var _user = req.session.user;
        app.locals.user = _user;
        next();
    });

    // Index
    app.get('/', Index.inedx);


	/* ＊＊＊ 用户 User ＊＊＊ */

    // 注册 --- /register (post)
    app.get('/register', User.noLoginRequired, User.showRegister);
    app.post('/register', User.register);
    
    // 登陆 --- /login (post)
    // 退出 --- /logout (get)


    /* ＊＊＊ 文章 Article ＊＊＊ */

    // 新文章 － /post (get)
    // 文章保存发布 － /post (post)
    // 文章编辑 - /post/edit/:id (get)
    // 文章删除 - /post/del/:id (get)

    // 获取一个人所有文章 － /u/:id (get)
    // 




    app.get('*', function(req, res){
    	res.render('404', {
    		title: 'Not Found'
    	});
    });
};