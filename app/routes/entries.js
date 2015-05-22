var express = require('express');
var router  = module.exports = express.Router();

var handle = plugin('controllers/controller').handle;
var Entries = plugin('controllers/entries');

router.get('/:type/create', handle('create', Entries));
router.post('/:type/create', handle('save', Entries));

router.get('/:type/edit/:filepath(*)', handle('edit', Entries));
router.post('/:type/edit/:filepath(*)', handle('save', Entries));

router.get('/:type/list', handle('list', Entries));
