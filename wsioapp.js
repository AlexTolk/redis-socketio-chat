const { pub, sub } = require('./data/redis');
const messages = require('./data/inmem')
const { Server } = require("socket.io");
module.exports = function(httpServer) {
    const wsServer = new Server(httpServer, {
        cors: '*',
    });

    sub('message', () => {
        wsServer.to(payload.to).emit('message', payload);
    })
    wsServer.on('connection', (socket) => {
        const userID = socket.id;
        console.log('a user connected');
        socket.on('join', (msg) => {
            socket.join(msg.id);
        });
        socket.on('leave', (msg) => {
            socket.leave(msg.id);
        });
        socket.on('get', (msg, reply) => {
            messages[msg.room] = messages[msg.room] || [];
            messages[msg.room].push(msg);
            msg.userID = userID;
            socket.to(msg.room).emit('message', msg);
            pub('message', msg);
            reply('ok');
        });
    });
};