var express = require('express');
var router = express.Router();

let users = [{
  id: Math.floor(Math.random() * 1000),
  name: `Alex - ${Math.floor(Math.random() * 1000)}`,
}];

/* POST users listing. */
router.post('/', function(req, res, next) {
  users.push(req.body);
  res.send('new user was created')
});

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send(users);
});

module.exports = router;
