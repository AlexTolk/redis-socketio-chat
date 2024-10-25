const express = require('express');
const { pub, sub } = require('../data/redis');
const messages = require('../data/inmem'); // Ensure this file exists and is implemented

const router = express.Router();
let io;


function setIo(instance) {
    io = instance;
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
    io.emit('message', { id, message });
    await pub('message', { id, message });

    res.status(201).send({ success: true, id });
});

sub('message', (payload) => {
    io.emit('message', payload);
});


module.exports = {
    router,
    setIo
};
