var express = require('express');

// Initializes the application with configuration and routes
module.exports = function(app, args) {
    var plugins = require('./services/plugins');

    app.use(express.static('public'));

    plugins.load(app, args);

    plugins.require('bootstrap/forms')(app);
    plugins.require('bootstrap/session')(app);
    plugins.require('bootstrap/auth')(app);
    plugins.require('bootstrap/routes')(app);
    plugins.require('bootstrap/messaging')(app);
    plugins.require('bootstrap/scripts')(app);
};
