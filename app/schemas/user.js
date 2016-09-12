var mongoose = require('mongoose');
var bcrypt = require('bcrypt');
var SALT_WORK_FACTOR = 10;


var UserSchema = new mongoose.Schema({
    name:{
        unique: true,
        type:String
    },
    password: String,
    email:String,
    avatar: {
        type: String,
        default: '/images/default.jpg'
    },
    motto:  String,

    //0 : normal user
    //1 : admin
    role:{
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

UserSchema.pre('save', function(next) {
    var user = this;
    if(this.isNew) {
        this.meta.createAt = this.meta.updateAt = Date.now();
        bcrypt.genSalt(SALT_WORK_FACTOR, function (err, salt) {
            if (err) {
                return next(err);
            }
            bcrypt.hash(user.password, salt, function (err, hash) {
                if (err) return next(err);

                user.password = hash;
                next();
            })
        });
    } else {
        this.meta.updateAt = Date.now();
        next();
    }
});

UserSchema.methods = {
    comparePassword: function(_password, cb) {
        bcrypt.compare(_password, this.password, function(err, isMatch) {
            if(err) {
                return  cb(err);
            }
            cb(null, isMatch);
        })
    }
};


UserSchema.statics = {
    // 获取所有用户
    fetch: function(cb) {
        return this
            .find({})
            .sort('mate.updateAt')
            .exec(cb);
    },
    // 通过id查找用户
    findById: function(id,cb) {
        return this
            .findOne({_id: id})
            .exec(cb);
    },
    // 通过昵称查找用户
    findByName: function(name, cb) {
        return this
            .findOne({name: name}, function(err, user) {
                if(err){
                    console.log(err);
                }
            })
            .exec(cb);
    }
};

module.exports = UserSchema;