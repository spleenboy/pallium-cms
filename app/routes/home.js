var express = require('express');
var router  = express.Router();

var plugins    = require('../services/plugins');
var Controller = plugins.require('controllers/controller');
var Home       = plugins.require('controllers/home');

module.exports = function(app) {
    var factory = new Controller.Factory(Home, app);

    router.get('/', factory.handle('list'));

    return router;
};
