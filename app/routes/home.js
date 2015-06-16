var express = require('express');
var router  = express.Router();

var handle = plugin('controllers/controller').handle;
var Home   = plugin('controllers/home');

module.exports = function(app) {
    router.get('/', handle('list', Home, app));

    return router;
};
