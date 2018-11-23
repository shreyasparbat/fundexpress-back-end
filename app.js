// Library imports
const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
require('dotenv').config();
const bodyParser = require('body-parser');

// Router imports
const indexRouter = require('./routes/index');
const userRouter = require('./routes/user');
const profileRouter = require('./routes/profile');
const itemRouter = require('./routes/item');
const ticketsRouter = require('./routes/tickets');
const adminRouter = require('./routes/admin');
const adminViewsRouter = require('./routes/adminViews');
const paymentRouter = require('./routes/payment');
const homeRouter = require('./routes/home');

// Custom imports
require('./db/mongoose');

// Init express app
const app = express();

// Set view engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// Add middleware
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Add routers
app.use('/', indexRouter);
app.use('/user', userRouter);
app.use('/profile', profileRouter);
app.use('/item', itemRouter);
app.use('/tickets', ticketsRouter);
app.use('/admin', adminRouter);
app.use('/adminViews', adminViewsRouter);
app.use('/payment', paymentRouter);
app.use('/home', homeRouter);

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
