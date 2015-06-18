var events = require('events');
var util   = require('util');
var hooks  = plugin('services/hooks');
var file   = plugin('services/file');
var log    = plugin('services/log')(module);

function Router(app) {
    events.EventEmitter.call(this);
    hooks.bubble(module, this, ['registering', 'registered']);
    this.register(app);
}

util.inherits(Router, events.EventEmitter);

Router.prototype.register = function(app) {
    var home    = plugin('routes/home');
    var entries = plugin('routes/entries');

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
