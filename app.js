var express      = require('express')
  , redis        = require('redis')
  , db           = redis.createClient()
  , http         = require('http')
  , path         = require('path')
  , favicon      = require('static-favicon')
  , logger       = require('morgan')
  , cookieParser = require('cookie-parser')
  , bodyParser   = require('body-parser')
  , routes       = require('./routes')
  , users        = require('./routes/user');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.set('title', 'Express app');

app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(require('less-middleware')({ src: path.join(__dirname, 'public') }));
app.use(express.logger());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.methodOverride());
app.use(app.router);

app.use(function(req, res, next){
  var ua = req.headers['user-agent'];
  db.zadd('online', Data.now(), ua, next);
});

app.use(function(req, res, next){
  var min = 60 * 1000;
  var ago = Date.now() - min;
  db.zrevrangebyscore('online', '+inf', ago, function(err, users){
    if (err) return next(err);
    req.online = users;
    next();
  });
});

app.get('/', function(req, res){
  res.render('index', {
    message: "welcome to my site"
  });
//   res.send(req.online.length + ' users online');
});
app.get('/users', users.list);
app.listen(3000);

/// catch 404 and forwarding to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        console.error(err.stack);
        res.send(500, err.stack);
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;
