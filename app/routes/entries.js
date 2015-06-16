var express = require('express');
var router  = express.Router();

var handle = plugin('controllers/controller').handle;
var Entries = plugin('controllers/entries');

var header = '/:domain?/:type/';

module.exports = function(app) {
    // HTTP requests
    router.get(header + 'create', handle('create', Entries, app));
    router.post(header + 'create', handle('save', Entries, app));

    router.get(header + 'unlock/:id', handle('unlock', Entries, app));
    router.get(header + 'edit/:id', handle('edit', Entries, app));
    router.post(header + 'edit/:id', handle('save', Entries, app));

    router.post(header + 'delete/:id', handle('delete', Entries, app));

    router.get(header + 'list', handle('list', Entries, app));

    router.get(header + 'file/:id/:field/:number?', handle('file', Entries, app));

    return router;
};
