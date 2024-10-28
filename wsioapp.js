const { pub, sub } = require('./data/redis');
const messages = require('./data/inmem')
const { Server } = require("socket.io");

module.exports = function(httpServer) {
    const wsServer = new Server(httpServer, {
        cors: {
            origin: 'http://localhost',
            methods: ['GET', 'POST'],
            credentials: true,
            transports: ['websocket', 'polling']
        },
        allowEIO3: true,
    });

    sub('message', (payload) => {
        messages[payload.to] = messages[payload.to] || [];
        messages[payload.to].push(payload);
        wsServer.to(payload.to).emit('message', payload);
    });
    
    wsServer.on('connection', (socket) => {
        const userID = socket.id;
        console.log('a user connected', userID);

        socket.on('join', (msg) => {
            console.log(`User joined room: ${msg.id}`);
            socket.join(msg.id);
        });

        socket.on('leave', (msg) => {
            console.log(`User left room: ${msg.id}`);
            socket.leave(msg.id);
        });

        socket.on('send', (msg, reply) => {
            messages[msg.to] = messages[msg.to] || [];
            messages[msg.to].push(msg);
            msg.userID = userID
            socket.to(msg.to).emit('message', msg);
            pub('message', msg);
            reply('ok');
        });
    });
};