var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session');
var flash = require('connect-flash');

var indexRouter = require('./routes/index');
var dashboard = require('./routes/dashboard');
var auth = require('./routes/auth');
require('dotenv').config();

var app = express();

// view engine setup
app.engine('ejs', require('express-ejs-extend')); 
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: 'mysupercat',
  resave: true,
  saveUninitialized: true,
  cookie: {magAge: 5000}
}));
app.use(flash());

const authCheck = (req, res, next) => {
  console.log('middle', req.session);
  if(req.session.uid === process.env.ADMIN_UID) {
    return next();
  }
  return res.redirect('/auth/signin');
}

app.use('/auth',auth);
app.use('/', indexRouter);
app.use('/dashboard',authCheck, dashboard);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  res.render('error',{
    title: '您所查看的頁面不存在:('
  });
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
