var Article = require('../models/article');
var Tag = require('../models/tag');
var xss = require('xss');

exports.detail = function(req, res) {
    Tag
        .find({})
        .populate({path: 'article', options: {limit: 5}})
        .exec(function(err, tags) {
            if(err) {
                console.log(err);
            }
            res.render('tag', {
                title: "萌え ♥  标签",
                tags: tags
            });
        });
};

exports.new = function(req, res) {
    res.render('tag_admin', {
        title: '萌え ♥ 标签新建',
        tag: {}
    })
};


// save
exports.save = function(req, res) {
    var _tag = req.body.tag;
    var tag = new Tag(_tag);
    tag.save(function(err,tag) {
        if(err) {
            console.log(err);
        }
        res.redirect('/admin/taglist');
    })
};

exports.list = function(req, res) {
    Tag.fetch(function(err, tags) {
        if(err){
            console.log(err);
        }
        res.render('tag_list', {
            title: '萌え ♥ 标签管理',
            tags: tags
        })
    });
};

//exports.del = function(req,res) {
//    var id = req.params.id;
//    var _user = req.session.user;
//    console.log(id);
//    if(id) {
//        Article.remove({_id: id}, function(err, article) {
//            if(err) {
//                console.log(err);
//            } else {
//                res.redirect('/u/' + _user.name);
//            }
//        });
//    }
//};

exports.getAll = function(req, res) {
    var tagId = req.query.tag;
    var page = req.query.p;
    var count = 10;
    var index = page * count;

    Article.find({tag:tagId})
        .populate('author','name avatar')
        .populate('tag', 'name')
        .sort({'meta.createAt': -1})
        .exec(function(err, articles) {
            if(err) {
                console.log(err);
            }
            if(articles) {
                var results = articles.slice(index, index + count);
                results.forEach(function(item){
//                    item.txt = xss(item.txt, {whiteList: {}, stripIgnoreTag: true});
                    item.txt = item.txt.length > 240 ? item.txt.slice(0, 240) + ' ... ' : item.txt;
                });

                Tag.find({}, function (err, tags) {
                    res.render('index', {
                        title: "萌え ♥ 标签 " + tags[0].name,
                        currentPage: page,
                        totalPage: Math.ceil(articles.length / count),
                        articles: results,
                        tags: tags,
                        query: 'tag=' + tagId
                    });
                });
            }
        });
};