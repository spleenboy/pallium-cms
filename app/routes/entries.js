var express = require('express');
var router  = module.exports = express.Router();

var handle = plugin('controllers/controller').handle;
var Entries = plugin('controllers/entries');

router.get('/:type/create', handle('create', Entries));
router.post('/:type/create', handle('save', Entries));

router.get('/:type/edit/:id', handle('edit', Entries));
router.post('/:type/edit/:id', handle('save', Entries));

router.post('/:type/delete/:id', handle('delete', Entries));

router.get('/:type/list', handle('list', Entries));
