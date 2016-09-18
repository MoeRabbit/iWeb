var Comment = require('../models/comment');
var User= require('../models/user');
var Acticle = require('../models/article');
//article comment
exports.save = function (req, res){
    var _comment = req.body.comment;
    var articleId = _comment.article;

    Article.update({_id: articleId}, {$inc: {comment: 1}}, function(err) {
        if(err) {
            console.log(err);
        }
    });

    if (_comment.cid) {
        Comment.findById(_comment.cid, function (err, comment) {
            var reply = {
                from: _comment.from,
                to: _comment.tid,
                content: _comment.content
            };
            comment.reply.push(reply);
            comment.save(function (err, comment) {
                if (err) {
                    console.log(err);
                }
                res.redirect('/p/' + articleId);
            });
        });
    } else {
        var comment = new Comment(_comment);

        comment.save(function (err, comment){
            if (err) {
                console.log(err);
            }
            res.redirect('/p/' + articleId);
        });
    }
};