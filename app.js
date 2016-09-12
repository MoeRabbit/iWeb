var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var mongoose = require('mongoose');
var mongoStore = require('connect-mongo')(session);
var morgan = require('morgan');
var multer = require('multer');
var flash = require('connect-flash');
var dbUrl = 'mongodb://localhost/iWeb';
var port = process.env.PORT || 2333;
var app = express();
mongoose.connect(dbUrl);

app.locals.moment = require('moment');
app.set('views', './views/pages');
app.set('view engine', 'jade');
app.use(express.static(path.join(__dirname, 'public')));
app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(morgan('dev'));     // 日志中间件
// parse application/json
app.use(bodyParser.json());
// parse application/x-www-form-urlencoded  加载解析urlencoded的请求体中间件
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session({
    secret:'na',
    store: new mongoStore({
        url: dbUrl,
        collection: 'sessions'
    }),
    resave: true,
    saveUninitialized: true
}));
app.use(flash());
// 文件上传
// app.use(multer({
//     dest: './public/upload',
//     rename: function(fieldname, filename){
//         return Date.now();
//     }
// }));


if('development' === app.get('env')){
    app.set('showStackError', true);
    app.use(morgan(':method :url :status'));
    app.locals.pretty = true;
    mongoose.set('debug', true);
}

require('./router')(app);

app.listen(port, function() {
    console.log('iBlog started on port ' + port);
});

