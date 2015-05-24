var passport = require('passport');

var Controller = plugin('controllers/controller');
var config = plugin('config');

var unprotected = ['/login', '/auth', '/verified', '/logout'];

function protection(req, res, next) {
    if (req.user || unprotected.indexOf(req.path) >= 0) {
        return next();
    }
    console.warn("Unauthorized URL requested", req.originalUrl);
    return res.redirect('/login');
}


function makeStrategy() {
    var Strategy     = require('passport-auth0');
    var authSettings = config.get('auth');
    authSettings.callbackURL = '/verified';

    function verified(accessToken, refreshToken, extraParams, profile, done) {
        console.info("Verification worked!", arguments);
        return done(null, profile);
    }

    passport.serializeUser(function(user, done) {
        done(null, user);
    });

    passport.deserializeUser(function(user, done) {
        done(null, user);
    });

    return new Strategy(authSettings, verified);
}


module.exports = function(app) {
    var strategy = makeStrategy();

    passport.use(strategy);
    app.use(passport.initialize());
    app.use(passport.session());

    app.use(protection);

    // Displays the login page
    app.get('/login', function(req, res, next) {
        var ctrl = new Controller(req, res, next);
        ctrl.send('auth/login');
    }); 

    // Triggers authentication by redirecting
    app.get('/auth', passport.authenticate(strategy.name));

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
