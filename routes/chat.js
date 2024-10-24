var express = require('express');
var router = express.Router();
const messages = require('../data/inmem');


router.get('/', async function(req, res, next) {
  res.send('Welcome to the chat application!');
});


router.get('/get/:id', async function(req, res, next) {
  res.send(messages[req.params.id] || []);
});

module.exports = router;
