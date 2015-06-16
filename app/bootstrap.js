var express = require('express.io');

// Initializes the application with configuration and routes
module.exports = function(app, args) {
    var plugins = require('./bootstrap/plugins');

    app.use(express.static('public'));

    plugins.load();

    plugin('bootstrap/forms')(app);
    plugin('bootstrap/session')(app);
    plugin('bootstrap/auth')(app);
    plugin('bootstrap/routes')(app);
};
