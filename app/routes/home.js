var express = require('express');
var router  = module.exports = express.Router();

var handle = plugin('controllers/controller').handle;
var Home   = plugin('controllers/home');

router.get('/', handle('list', Home));
