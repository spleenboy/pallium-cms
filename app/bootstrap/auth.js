var passport = require('passport');

var plugins    = require('../services/plugins');
var Controller = plugins.require('controllers/controller');
var config     = plugins.require('config');
var log        = plugins.require('services/log')(module);

var unprotected = ['/login', '/auth', '/verified', '/logout'];

function protection(req, res, next) {

    // Safe urls
    if (unprotected.indexOf(req.path) >= 0) {
        return next();
    }

    // Not logged in!
    if (!req.user) {
        return res.redirect('/login');
    }

    var allowed = config.get('auth.allow', req.user);
    if (allowed === true || allowed === undefined) {
        // config-approved!
        return next();
    }

    if (allowed !== undefined) {
        log.warn("User is not allowed", req.originalUrl, req.user);
    } else {
        log.warn("Unauthorized URL requested", req.originalUrl, req.user);
    }
    return res.redirect('/login');
}

function createStrategy() {
    var name     = config.get('auth.name');
    var settings = config.get('auth.settings');
    settings.callbackURL = '/verified';

    if (name === 'none') {
        return false;
    }
    else if (name === 'auth0') {
        var Strategy = require('passport-auth0');
        return new Strategy(settings,
            function verified(access, refresh, extra, profile, done) {
                return done(null, profile);
            }
        );
    } 
    else if (name === 'google') {
        var Strategy = require('passport-google-oauth').OAuth2Strategy;
        return new Strategy(settings,
            function verified(access, refresh, profile, done) {
                return done(null, profile);
            }
        );
    }

    throw new Error("Invalid strategy");
}


function getAuthenticate() {
    var name = config.get('auth.name');

    if (name === 'google') {
        return passport.authenticate(name, {scope: config.get('auth.scope')});
    }

    return passport.authenticate(name);
}


module.exports = function(app) {
    var strategy = createStrategy();

    if (!strategy) {
        log.info("No authentication strategy specified");
        return;
    }

    passport.use(strategy);
    passport.serializeUser(function(user, done) {done(null, user);});
    passport.deserializeUser(function(user, done) {done(null, user);});

    app.use(passport.initialize());
    app.use(passport.session());

    app.use(protection);

    log.info("Using", strategy.name, "auth strategy");

    // Displays the login page
    app.get('/login', function(req, res, next) {
        var factory = new Controller.Factory(Controller, app);
        var ctrl = factory.create(req, res, next);
        ctrl.send('auth/login');
    }); 

    // Triggers authentication by redirecting
    app.get('/auth', getAuthenticate());

    // The callback URL after auth verification
    app.get('/verified', 
        passport.authenticate(strategy.name, {
            successRedirect: '/',
            failureRedirect: '/login'
        })
    );

    // Does just what you think it does.
    app.post('/logout', function(req, res) {
        req.logout();
        res.redirect('/login');
    });
};
