var express = require('express');
var events = require('events');
var util   = require('util');
var plugins = require('../services/plugins');
var hooks  = plugins.require('services/hooks');
var file   = plugins.require('services/file');
var log    = plugins.require('services/log')(module);
var config = plugins.require('config');
var View   = plugins.require('views/view');

function Router(app) {
    events.EventEmitter.call(this);
    hooks.bubble(module, this, ['registering', 'registered']);
    this.register(app);
}

util.inherits(Router, events.EventEmitter);

Router.prototype.register = function(app) {
    var home    = plugins.require('routes/home');
    var entries = plugins.require('routes/entries');

    var homeRouter = express.Router();
    home(homeRouter, app);
    app.use('/', homeRouter);

    var entryRouter = express.Router();
    entries(entryRouter, app);
    app.use('/entry', entryRouter);

    this.emit('registering', function(id, register) {
        var base = '/use/' + file.slug(id);
        var pluginRouter = express.Router();
        register(pluginRouter, app);
        app.use(base, pluginRouter);
        log.debug('Setting up routes for plugin at', base);
    });

    app.use(function(req, res, next) {
        res.status(404);
        var data = {
            site: config.get('site'),
            request: req
        };
        var view = new View('404', data);
        res.send(view.render());
    });
};

module.exports = function(app) {
    return new Router(app);
};
