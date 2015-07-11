var events = require('events');
var util   = require('util');
var plugins = require('../services/plugins');
var hooks  = plugins.require('services/hooks');
var file   = plugins.require('services/file');
var log    = plugins.require('services/log')(module);

function Router(app) {
    events.EventEmitter.call(this);
    hooks.bubble(module, this, ['registering', 'registered']);
    this.register(app);
}

util.inherits(Router, events.EventEmitter);

Router.prototype.register = function(app) {
    var home    = plugins.require('routes/home');
    var entries = plugins.require('routes/entries');

    app.use('/',      home(app));
    app.use('/entry', entries(app));

    var event = {
        'express' : require('express'),
        'app'     : app,
        'routers' : {}
    };

    this.emit('registering', event);

    for (var key in event.routers) {
        var base = '/use/' + file.slug(key);
        app.use(base, event.routers[key]);
        log.debug('Using router at', base);
    }
};

module.exports = function(app) {
    return new Router(app);
};
