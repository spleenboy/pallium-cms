var express = require('express');

var bodyParser = require('body-parser');

// Initializes the application with configuration and routes
module.exports = function(app, args) {
    require('./bootstrap/globals')(app, args);
    require('./bootstrap/plugins')(app, args);

    app.use(express.static('public'));

    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({extended: true}));

    plugin('bootstrap/session')(app);
    plugin('bootstrap/auth')(app);
    plugin('bootstrap/routes')(app);
};
