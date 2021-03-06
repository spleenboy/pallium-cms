var express = require('express');

var plugins = require('../services/plugins');
var config     = plugins.require('config');
var Controller = plugins.require('controllers/controller');
var Entries    = plugins.require('controllers/entries');

module.exports = function(router, app) {
    var header = '/:domain/:type/';
    var factory = new Controller.Factory(Entries, app);

    router.get( '/:domain/', factory.handle('landing'));

    router.get( header + 'list', factory.handle('list'));

    router.get( header + 'create', factory.handle('create'));
    router.post(header + 'create', factory.handle('save'));

    router.get( header + 'edit/:id',   factory.handle('edit'));
    router.post(header + 'edit/:id',   factory.handle('save'));

    if (config.get('entry.locker.enabled')) {
        router.get( header + 'unlock/:id', factory.handle('unlock'));
        router.post(header + 'lock/:id',   factory.handle('lock'));
    }

    router.post(header + 'delete/:id', factory.handle('delete'));

    router.get( header + 'file/:id/:field/:number?', factory.handle('file'));
};
