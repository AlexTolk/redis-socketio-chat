const { Server } = require("socket.io");
module.exports = function(httpServer) {
    const wsServer = new Server(httpServer, {
        cors: '*',
    });

    let messages = {};

    wsServer.on('connection', (socket) => {
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
            reply('ok');
            socket.to(msg.room).emit('message', msg);
        });
        socket.on('get', (msg, reply) => {
            reply(messages[msg.room] || []);
        });
    });
};