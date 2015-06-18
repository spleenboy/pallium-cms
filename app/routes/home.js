var express = require('express');
var router  = express.Router();

var Controller = plugin('controllers/controller');
var Home       = plugin('controllers/home');

module.exports = function(app) {
    var factory = new Controller.Factory(Home, app);

    router.get('/', factory.handle('list'));

    return router;
};
