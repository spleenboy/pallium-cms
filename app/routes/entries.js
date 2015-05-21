var express = require('express');
var router  = module.exports = express.Router();

var handle = plugin('controllers/controller').handle;
var Entries = plugin('controllers/entries');

router.get('/create/:type', handle('create', Entries));
router.post('/create/:type', handle('save', Entries));

router.get('/edit/:type/:name', handle('edit', Entries));
router.post('/edit/:type/:name', handle('save', Entries));

router.get('/list/:type', handle('list', Entries));
