const express = require('express');
const messages = require('../data/inmem');

const router = express.Router();

router.get('/get/:id', async (req, res, next) => {
    res.send(messages[req.params.id] || []);
})

module.exports = router;