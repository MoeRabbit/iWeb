var User = require('../models/user');
var _ = require('underscore');
var fs = require('fs');

// 注册
exports.showRegister = function (req, res) {
    res.render('register', {
        title: '注册 | MoeRabbit'
    });
};

// 登录
exports.showLogin = function (req, res) {
    res.render('login', {
        title: '登录 | MoeRabbit'
    });
};

// 设置
exports.set = function(req, res){
    var user = req.session.user;
    res.render('set', {
        title: user.name + '| 个人信息修改',
        user: user
    });
};

// 权限控制
exports.noLoginRequired = function (req, res, next) {
    var user = req.session.user;
    if(user) {
        return res.redirect('/');
    }
    next();
};
exports.loginRequired = function (req, res, next) {
    var user = req.session.user;
    if (!user) {
        return res.redirect('/login');
    }
    next();
};
exports.adminRequired = function (req, res, next) {
    var user = req.session.user;

    if (user.role == 0) {
        return res.redirect('/login');
    }
    next();
};

// 注册 - 用户保存
exports.register = function(req, res){
    var _user = req.body;
    User.findOne({
        $or : [{name: _user.name},{email: _user.email}]
    }, function(err, user) {
        var error = {};
        if (err) {
            res.json({
                status: 0,
                error: {
                    code: 100,
                    err: '服务器错误，请稍后再试'
                }
            });
            return;
        }
        if (user) {
            if(user.name == _user.name){
                error = {
                    code: 101,
                    err: '该昵称已经存在'
                }
            } else if(user.email == _user.email){
                error = {
                    code: 102,
                    err: '该邮箱已经被注册,请直接登录'
                }
            }
            res.json({
                status: 2,
                error: error
            });
        } else {
            var iuser = new User(_user);
            iuser.save(function(err, user) {
                if (err) {
                    res.json({
                        status: 0,
                        error: {
                            code: 103,
                            err: '注册失败，请稍后再试'
                        }
                    });
                } else {
                    req.session.user = user;
                    res.json({
                        status: 1
                    });
                }
            });
        }
    });
};

// 用户登录
exports.login = function(req, res) {
    var _user = req.body;
    var email = _user.email;
    var password = _user.password;

    User.findOne({email: email}, function(err, user) {
        if(err) {
            res.json({
                status: 0,
                error: {
                    code: 200,
                    err: '服务器错误，请稍后再试'
                }
            });
            return;
        }
        if(!user) {
            res.json({
                status: 0,
                error: {
                    code: 201,
                    err: '该账户不存在'
                }
            });
            return;
        }
        user.comparePassword(password, function(err, isMatch) {
            if(err) {
                res.json({
                    status: 0,
                    error: {
                        code: 202,
                        err: '服务器错误，请稍后再试'
                    }
                });
                return;
            }
            if(isMatch){
                req.session.user = user;
                res.json({
                    status: 1
                });
            } else {
                res.json({
                    status: 0,
                    error: {
                        code: 203,
                        err: '密码错误'
                    }
                });
            }
        });
    });
};

// 用户退出
exports.logout = function(req,res) {
    delete req.session.user;
    //- delete app.locals.user;
    res.redirect('/');
};

// 用户信息修改
exports.update = function(req, res){ };

// 用户修改头像
exports.updateAvatar = function(req, res){};

// 用户管理 - 获取所有用户
exports.getAllUser = function(req, res){};

// 用户管理 - 删除用户
exports.del = function(req, res){};
 
