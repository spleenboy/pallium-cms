var bodyParser = require('body-parser');
var multer     = require('multer');

var plugins = require('../services/plugins');
var config = plugins.require('config');
var log    = plugins.require('services/log')(module);

module.exports = function(app, args) {
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({extended: true}));
    log.info('Using body-parser');

    app.use(multer());
    log.info('Using multer for multipart posts');
};
