var Article = require('../models/article');
var User = require('../models/user');
var Tag = require('../models/tag');
var Comment = require('../models/comment');
var _ = require('underscore');
var xss = require('xss');

exports.new = function(req, res) {
    Tag.fetch(function(err, tags) {
        res.render('post', {
            title: '新文章 | MoeRabbit',
            article: {},
            tags: tags
        })
    });
};

exports.save = function(req, res) {
    var id = req.body.article._id;
    var articleObj = req.body.article;
    var _user = req.session.user;
    var _article = new Article(articleObj);
    _article.author = _user._id;

    var tagName = article.tagName;

    function tagSave(tagName, articleId){
        Tag.find({'name': tagName}, function(err, tag) {
            if(tag && tag.length > 0){
                tag = tag[0];
                tag.articles.push(articleId);
                tag.articlesLen = tag.articles.length;
                tag.save(function(err, tag) {
                    _article.tag = tag._id;
                    _article.save(function(err, article) {
                        res.redirect('/p/' + articleId);
                    });
                })
            } else {
                var tag = new Tag({
                    name: tagName,
                    articles: [articleId],
                    articlesLen: 1
                });
                tag.save(function(err, tag) {
                    _article.tag = tag._id;
                    _article.save(function(err, article) {
                        res.redirect('/p/' + articleId);
                    });
                })
            }
        });
    }

    if(id) {
        Article.findById(id, function(err, article) {
            if(err) {
                console.log(err);
            }
            _article = _.extend(article, articleObj);
            if(article.tag.name != tagName) {
                Tag.update({"articles": id}, {"$pull": {"articles": id}}, function (err, tag) {
                    if (err) {
                        console.log(err);
                    }
                });
                tagSave(tagName, id);
            } else {
                _article.save(function(err, article) {
                    res.redirect('/p/' + id);
                });
            }
        });
    } else {
        if(tagName) {
            tagSave(tagName, _article._id);
        }
    }
};

//exports.list = function(req, res) {
//    Article.fetch(function(err, articles) {
//        if(err){
//            console.log(err);
//        }
//        res.render('list-article', {
//            title: '萌え ♥ 文章管理',
//            articles: articles
//        })
//    });
//};

exports.del = function(req,res) {
    var id = req.params.id;
    var _user = req.session.user;
    if(id) {
        Article.remove({_id: id}, function(err, article) {
            if(err) {
                console.log(err);
            } else {
                Comment.remove({article: id}, function(err, comment){
                    if(err) {
                        console.log(err);
                    }
                });
                Tag.update({"articles": id},{"$pull": {"articles": id}},function(err,tag){
                    if(err) {
                        console.log(err);
                    }
                });
                res.redirect('/u/' + _user._id);
            }
        });
    }
};


exports.edit = function(req, res) {
    var id = req.params.id;

    if(id) {
        Article.findById(id, function (err, article) {
            Tag.fetch(function(err, tags) {
                res.render('article', {
                    title: '编辑 | Moerabbit ' + article.title,
                    article: article,
                    tags: tags
                })
            })
        });
    }
};
//获取一个人的所有文章（传入参数 author）
exports.showAll = function(req, res) {
    var author = req.params.id;
    var page = req.query.p ? parseInt(req.query.p) : 0;
    var count = 10;
    var index = page * count;

    User.findById(author, function(err, user) {
        console.log(user);
        if (!user) {
            console.log('error: No User');
            res.redirect('/404');
        } else {
            .getAll(author, function (err, articles) {
                if (err) {
                    req.flash('error', err);
                    res.redirect('/');
                }

                var results = articles.slice(index, index + count);
                results.forEach(function(item){
//                item.txt = xss(item.txt, {whiteList: {}, stripIgnoreTag: true});
                    item.txt = item.txt.length > 200 ? item.txt.slice(0, 200) + ' ... ' : item.txt;
                });
                Tag.find({user: author}, function (err, tags) {
                    res.render('user', {
                        title: '萌え ♥ ' + user.name,
                        articles: results,
                        author: user,
                        tags: tags,
                        query: '/u/' + author + '/?',
                        currentPage: page,
                        totalPage: Math.ceil(articles.length / count)
                    });
                });
            });
        }
    });
};

//文章归档（传入参数 author）
exports.archive = function(req, res){
    var author = req.params.id;
    var page = req.query.p ? parseInt(req.query.p) : 0;
    var count = 20;
    var index = page * count;

    User.findById(author, function(err, user) {
        if (!user) {
            console.log('error: No User');
            res.redirect('/404');
        } else {
            Article.getAll(author, function (err, articles) {
                if (err) {
                    req.flash('error', err);
                    res.redirect('/');
                }
                var results = articles.slice(index, index + count);
                Tag.find({user: author}, function (err, tags) {
                    res.render('archive', {
                        title: '萌え ♥ ' + user.name,
                        articles: results,
                        author: user,
                        tags: tags,
                        query: '/u/' + author + '/archive?',
                        currentPage: page,
                        totalPage: Math.ceil(articles.length / count)
                    });
                });
            });
        }

    });
};

exports.showOne = function(req, res) {
    var id = req.params.id;
    var userId = '';
    if(req.session.user){
        userId = req.session.user._id;
    }

    Article.findById(id, function(err, article) {
        if(article){
            if(article.author._id != userId || userId == ''){ //当非作者阅读的时候 PV + 1
                Article.update({_id: id}, {$inc: {pv: 1}}, function(err) {
                    if(err) {
                        console.log(err);
                    }
                });
            }

            Comment.getAll(id, function(err, comments) {
                if(err){
                    req.flash('error', err);
                    res.redirect('/');
                }
                res.render('article', {
                    title: article.author.name + ' ♥ ' + article.title,
                    article: article,
                    comments: comments
                })
            });
        }
    });
};

exports.sea = function(req, res) {
    var page = req.query.p ? parseInt(req.query.p) : 0;
    var count = 10;
    var index = page * count;
    var keyword = req.query.keyword;
    Article.search(keyword, function(err, articles) {
        if(err) {
            console.log(err);
            return res.redirect('/');
        }

        var results = articles.slice(index, index + count);
        results.forEach(function(item){
//            item.txt = xss(item.txt, {whiteList: {}, stripIgnoreTag: true});
            item.txt = item.txt.length > 200 ? item.txt.slice(0, 200) + ' ... ' : item.txt;
        });

        Tag.fetch(function(err, tags) {
            res.render('index', {
                title: "萌え ♥ 查找 " + keyword,
                articles: results,
                tags: tags,
                query: '/search?keyword=' + keyword,
                currentPage: page,
                totalPage: Math.ceil(articles.length / count)
            });
        });

    })
};