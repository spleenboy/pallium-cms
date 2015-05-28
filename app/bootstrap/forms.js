var body = require('body-parser');
var log  = plugin('services/log');

module.exports = function(app, args) {
    app.use(body.json());
    app.use(body.urlencoded({extended: true}));
    log.info('Using body-parser');
};
