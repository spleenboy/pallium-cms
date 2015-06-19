var express = require('express');
var router  = express.Router();

var Controller = plugin('controllers/controller');
var Entries    = plugin('controllers/entries');

module.exports = function(app) {
    var header = '/:domain?/:type/';
    var factory = new Controller.Factory(Entries, app);

    router.get( header + 'list', factory.handle('list'));

    router.get( header + 'create', factory.handle('create'));
    router.post(header + 'create', factory.handle('save'));

    router.get( header + 'unlock/:id', factory.handle('unlock'));

    router.get( header + 'edit/:id',   factory.handle('edit'));
    router.post(header + 'edit/:id',   factory.handle('save'));

    router.post(header + 'delete/:id', factory.handle('delete'));

    router.get( header + 'file/:id/:field/:number?', factory.handle('file'));

    return router;
};
