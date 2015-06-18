var util       = require('util');
var events     = require('events');

var config     = plugin('config');
var log        = plugin('services/log')(module);
var hooks      = plugin('services/hooks');
var Definition = plugin('models/entry-definition');
var View       = plugin('views/view');

function Controller() {
    events.EventEmitter.call(this);
    hooks.bubble(module, this, ['sending', 'sent', 'populating']);
    this.viewBase = process.cwd() + '/app/views';
    this.request  = null;
    this.response = null;
    this.next     = null;
    this.app      = null;
};


util.inherits(Controller, events.EventEmitter);


/**
 * Send the output of a template¬
**/
Controller.prototype.send = function(name, data) {
    data = this.populate(data);
    var view = new View(name, data);
    view.base = this.viewBase;

    var event = {
        'view'       : view,
        'controller' : this
    };

    this.emit('sending', event);

    var content = event.view.render();
    this.response.send(content);

    this.emit('sent', event);
};


Controller.prototype.sendError = function(code, message) {
    var data = {
        code    : code,
        message : message
    };
    this.response.status(data.code);
    this.send('error', data);
};


Controller.prototype.populate = function(data) {
    data = data || {};

    data.site    = config.get('site');
    data.entries = new Definition(this.request.params.domain);

    data.params = this.request.params;
    data.flash  = this.request.flash();
    data.user   = this.request.user;

    var event = {
        'data'       : data,
        'controller' : this
    };

    data.sidebar = {};

    this.emit('populating', event);

    return event.data;
}


Controller.prototype.notfound = function() {
    var data = {
        code : 404
    };
    this.response.status(data.code);
    this.send('error', data);
};


function ControllerFactory(model, app) {
    this.model = model;
    this.app = app;
}


ControllerFactory.prototype.handle = function(action) {
    var cc  = this.model;
    var app = this.app;

    return function(req, res, next) {
        var controller = new cc();

        controller.request  = req;
        controller.response = res;
        controller.next     = next;
        controller.app      = app;

        if (typeof controller[action] === 'function') {
            return controller[action].call(controller);
        }
        else if (controller.notfound) {
            return controller.notfound.call(controller);
        }
        else {
            log.error('Controller', controller, 'cannot handle action', action);
            return next();
        }
    }
}

Controller.Factory = ControllerFactory;


module.exports = Controller;
