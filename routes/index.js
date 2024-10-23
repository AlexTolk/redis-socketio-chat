var express = require('express');
var router = express.Router();
const redis = require('../data/redis')

/* GET home page. */
router.get('/', async function(req, res, next) {
  let count = await redis.get('count', 0);
  count++;
  redis.set('count', count);
  res.send({ title: 'Chickens: ' + count });
});

module.exports = router;
