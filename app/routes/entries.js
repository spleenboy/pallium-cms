var express = require('express');
var router  = module.exports = express.Router();

var handle = plugin('controllers/controller').handle;
var Entries = plugin('controllers/entries');

var header = '/:domain?/:type/';

router.get(header + 'create', handle('create', Entries));
router.post(header + 'create', handle('save', Entries));

router.get(header + 'edit/:id', handle('edit', Entries));
router.post(header + 'edit/:id', handle('save', Entries));

router.post(header + 'delete/:id', handle('delete', Entries));

router.get(header + 'list', handle('list', Entries));

router.get(header + 'file/:id/:field/:number?', handle('file', Entries));
