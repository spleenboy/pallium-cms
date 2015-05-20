var express = require('express');
var router  = module.exports = express.Router();

var handle = plugin('controllers/controller').handle;
var Entries = plugin('controllers/entries');

router.get('/:type', handle('list', Entries));
router.get('/:type/new', handle('create', Entries));
router.get('/:type/:name', handle('edit', Entries));
router.post('/:type/:name', handle('save', Entries));
