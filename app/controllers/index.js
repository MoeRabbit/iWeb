var Article= require('../models/article');
var Tag = require('../models/tag');
var User= require('../models/user');
var xss = require('xss');

exports.index = function(req, res) {
    var page = req.query.p ? parseInt(req.query.p) : 0;
    var count = 10;
    var index = page * count;

    Article.fetch(function(err, articles) {
        if (err) {
            console.log(err);
        }
        var results = articles.slice(index, index + count);
        results.forEach(function(item){
//            item.txt = xss(item.txt, {whiteList: {}, stripIgnoreTag: true});  //去掉样式
            item.txt = item.txt.length > 240 ? item.txt.slice(0, 240) : item.txt;
        });
        Tag.fetch(function(err, tags) {
            res.render('index', {
                title: "萌兔子 ♥ ~",
                articles: results,
                tags: tags,
                query: '/?',
                currentPage: page,
                totalPage: Math.ceil(articles.length / count)
            });
        });
    });
};