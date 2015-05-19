var express = require('express');
var router  = module.exports = express.Router();

var control = plugin('controllers/control');
var home    = plugin('controllers/home');

router.get('/', control('list', home));
router.post('/login', control('login', home));
router.post('/logout', control('logout', home));
