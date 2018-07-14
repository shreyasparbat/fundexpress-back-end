// Library imports
const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

// Router imports
const indexRouter = require('./routes/index');
const userLoginOnboardRouter = require('./routes/userLoginOnboard');
const userProfileRouter = require('./routes/userProfile');
const homeRouter = require('./routes/home');
const pawnRouter = require('./routes/pawn');

// Custom imports
const {mongoose} = require('./db/mongoose'); // don't remove

// Init express app
const app = express();

// Set view engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// Add middleware
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Add routers
app.use('/', indexRouter);
app.use('/user', userLoginOnboardRouter);
app.use('/profile', userProfileRouter);
app.use('/home', homeRouter);
app.use('/pawn', pawnRouter);

// Catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

// Error handler
app.use(function (err, req, res) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;
