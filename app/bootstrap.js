var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
var FileStore = require('session-file-store')(session);

// Initializes the application with configuration and routes
module.exports = function(app, args) {
    require('./globals')(app, args);
    require('./plugins')(app, args);

    app.use(express.static('public'));

    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({extended: true}));

    app.use(session({
        secret: 'the mind is not the brain',
        store: new FileStore(),
        resave: false,
        saveUninitialized: true
    }));

    plugin('routes')(app);
};
