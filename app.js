const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const http = require('http');
const socketIo = require('socket.io');
const { createClient } = require('redis');
const { createAdapter } = require('@socket.io/redis-adapter');
const { router: chatRouter, setIo } = require('./routes/chat');

const app = express();
const server = http.createServer(app);


const redisClient = createClient({
    url: 'redis://redis:6379',
});

const pubClient = redisClient.duplicate();
const subClient = pubClient.duplicate();

async function connectClients() {
    try {
        await redisClient.connect();
        await pubClient.connect();
        await subClient.connect();
    } catch (error) {
        console.error("Error connecting to Redis clients:", error);
    }
}

connectClients().then(() => {
    const io = socketIo(server);
    const redisAdapter = createAdapter(pubClient, subClient);
    io.adapter(redisAdapter);
    
    
    setIo(io);
});


app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', chatRouter);

app.use(function(req, res, next) {
    next(createError(404));
});

app.use(function(err, req, res, next) {
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
    res.status(err.status || 500);
    res.send('error');
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

module.exports = app;
