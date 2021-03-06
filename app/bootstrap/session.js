var session = require('express-session');
var flash   = require('connect-flash');
var FileStore = require('session-file-store')(session);
var plugins = require('../services/plugins');
var log     = plugins.require('services/log')(module);

module.exports = function(app, args) {
    app.use(session({
        secret: 'the mind is not the brain',
        store: new FileStore(),
        resave: false,
        saveUninitialized: true
    }));

    app.use(flash());

    log.info("Using express-session, session-file-store, and connect-flash");
};
