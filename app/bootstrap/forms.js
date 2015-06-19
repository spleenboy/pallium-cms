var bodyParser = require('body-parser');
var multer     = require('multer');

var config = plugin('config');
var log    = plugin('services/log')(module);

module.exports = function(app, args) {
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({extended: true}));
    log.info('Using body-parser');

    app.use(multer());
    log.info('Using multer for multipart posts');
};
