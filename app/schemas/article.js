var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.Types.ObjectId;

var ArticleSchema = new Schema({
    title: String,
    txt: String,
    author: {
        type: ObjectId,
        ref: 'User'
    },
    tag: {
        type: ObjectId,
        ref: 'Tag'
    },
    comment: {
        type: Number,
        default: 0
    },
    pv: {
        type: Number,
        default: 0
    },
    meta: {
        createAt: {
            type:Date,
            default: Date.now()
        },
        updateAt: {
            type:Date,
            default: Date.now()
        }
    }
});

ArticleSchema.pre('save', function(next) {
    if(this.isNew) {
        this.meta.createAt = this.meta.updateAt = Date.now();
    } else {
        this.meta.updateAt = Date.now();
    }
    next();
});

ArticleSchema.statics = {
    fetch: function (cb) {
        return this
            .find({})
            .populate('author','name avatar')
            .populate('tag','name')
            .sort({'meta.createAt': -1})
            .exec(cb);
    },
    findById: function (id, cb) {
        return this
            .findOne({_id: id})
            .populate('author','name avatar')
            .populate('tag','name')
            .exec(cb);
    },
//  通过用户id查找文章 - 查找用户所有文章
    getAll: function (id, cb) {
        var query = {};
        if (id) {
            query.author = id;
        }
        return this
            .find(query)
            .populate('tag','name')
            .populate('author', 'name avatar motto')
            .sort({'meta.createAt': -1})
            .exec(cb);
    },
//  文章标题搜索
    search: function(keyword, cb) {
        var pattern = new RegExp(keyword, 'i');
        return this
            .find({'title': pattern})
            .populate('author','name avatar')
            .populate('tag','name')
            .sort({'meta.createAt': -1})
            .exec(cb);
    }
};

module.exports = ArticleSchema;