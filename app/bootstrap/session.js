var session = require('express-session');
var flash   = require('connect-flash');
var FileStore = require('session-file-store')(session);

module.exports = function(app, args) {
    app.use(session({
        secret: 'the mind is not the brain',
        store: new FileStore(),
        resave: false,
        saveUninitialized: true
    }));

    app.use(flash());
};
