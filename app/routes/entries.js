var express = require('express');
var router  = module.exports = express.Router();

var control = plugin('controllers/control');
var entries = plugin('controllers/entries');

router.get('/:type', control('list', entries));
router.get('/:type/new', control('create', entries));
router.get('/:type/:name', control('edit', entries));
router.post('/:type/:name', control('save', entries));
