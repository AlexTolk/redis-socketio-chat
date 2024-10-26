const express = require('express');
const { pub, sub, connectClients } = require('../data/redis');
const messages = require('../data/inmem');

const router = express.Router();
let io;

async function setIo(instance) {
    if (!instance) {
        console.error('Socket.io instance not available!');
        return;
    }
    io = instance;


    await connectClients();


    sub.on('message', (channel, message) => {
        const payload = JSON.parse(message);
        if (io) {
            io.emit('message', payload);
        } else {
            console.error('Socket.io instance not set for emitting messages');
        }
    });

    await sub.subscribe('message');
}

router.get('/', (req, res) => {
    res.send('Welcome to the chat application!');
});

router.get('/get/:id', async (req, res) => {
    res.send(messages[req.params.id] || []);
});

router.post('/send', async (req, res) => {
    const message = req.body.message;
    const id = req.body.id || new Date().getTime().toString();

    messages[id] = message;
    if (io) {
        io.emit('message', { id, message });
    } else {
        console.error('Socket.io instance not set for emitting messages');
    }
    await pub.publish('message', JSON.stringify({ id, message }));

    res.status(201).send({ success: true, id });
});

module.exports = {
    router,
    setIo
};
