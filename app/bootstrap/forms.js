var body = require('body-parser');

module.exports = function(app, args) {
    app.use(body.json());
    app.use(body.urlencoded({extended: true}));
    console.info('Using body-parser');
};
