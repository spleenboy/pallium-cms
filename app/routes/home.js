var express = require('express');

var plugins    = require('../services/plugins');
var Controller = plugins.require('controllers/controller');
var Home       = plugins.require('controllers/home');

module.exports = function(router, app) {
    var factory = new Controller.Factory(Home, app);
    router.get('/', factory.handle('list'));
};
