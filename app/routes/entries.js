var express = require('express');
var router  = module.exports = express.Router();

var handle = plugin('controllers/controller').handle;
var Entries = plugin('controllers/entries');

router.get('/create/:type', handle('create', Entries));
router.post('/create/:type', handle('save', Entries));

router.get('/edit/:type/:filepath', handle('edit', Entries));
router.post('/edit/:type/:filepath', handle('save', Entries));

router.get('/list/:type', handle('list', Entries));
