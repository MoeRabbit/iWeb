var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.Types.ObjectId;

var TagSchema = new Schema({
    name: {
        unique: true,
        type: String
    },
    articles: [{type: ObjectId, ref: 'Article'}],
    articlesLen: {
        type: Number,
        default: 0
    },
    meta: {
        createAt: {
            type: Date,
            default: Date.now()
        },
        updateAt: {
            type: Date,
            default: Date.now()
        }
    }
});

TagSchema.pre('save', function(next) {
    if (this.isNew) {
        this.meta.createAt = this.meta.updateAt = Date.now();
    } else {
        this.meta.updateAt = Date.now();
    }
    next()
});

TagSchema.statics = {
    fetch: function(cb) {
        return this
            .find({})
            .populate('articles','title author txt meta')
            .sort({'articlesLen': -1})
            .exec(cb);
    },
    findById: function(id, cb) {
        return this
            .find({_id: id})
            .populate('articles','title author txt meta')
            .populate('users', 'name avatar')
            .exec(cb);
    }
};

module.exports = TagSchema;