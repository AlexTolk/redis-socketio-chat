const createError = require('http-errors');
const express = require('express');
const path = require('path');
const logger = require('morgan');
const cors = require('cors');

const chatRouter = require('./routes/chat');


const app = express();

// Middleware setup
app.use(cors({
    origin: 'http://localhost:8080',
    methods: ['GET', 'POST'],
    credentials: true,
}));
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Serve static files if needed (only if serving assets from 'public')
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/', chatRouter);

// Error handling
app.use((req, res, next) => {
    next(createError(404));
});
app.use((err, req, res, next) => {
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
    res.status(err.status || 500);
    res.send('error');
});


module.exports = app;
