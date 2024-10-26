const { pub, sub } = require('./data/redis');
const messages = require('./data/inmem')
const { Server } = require("socket.io");

module.exports = function(httpServer) {
    const wsServer = new Server(httpServer, {
        cors: '*',
    });

    sub('message', (payload) => {
        if (payload.room) {
            wsServer.to(payload.room).emit('message', payload);
        } else {
            wsServer.emit('message', payload);
        }
    })
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

        socket.on('get', async (msg, reply) => {
            const { room, message } = msg;
            const payload = {
                id: new Date().getTime().toString(),
                userID,
                room,
                message,
            };
            
            messages[room] = messages[room] || [];
            messages[room].push(payload);

            socket.to(room).emit('message', payload);
            
            await pub('message', payload);

            reply('ok');
        });
    });
};