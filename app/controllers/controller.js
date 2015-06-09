var util       = require('util');
var events     = require('events');

var config     = plugin('config');
var log        = plugin('services/log')(module);
var hooks      = plugin('services/hooks');
var Definition = plugin('models/entry-definition');
var View       = plugin('views/view');

function Controller(req, res, next) {
    events.EventEmitter.call(this);
    hooks.bubble(module, this, ['sending', 'sent', 'populating']);
    this.request  = req;
    this.response = res;
    this.next     = next;
};


util.inherits(Controller, events.EventEmitter);


/**
 * Send the output of a template¬
**/
Controller.prototype.send = function(name, data) {
    data = this.populate(data);
    var view = new View(name, data);

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

    data.actions = [];

    data.params = this.request.params;
    data.flash  = this.request.flash();
    data.user   = this.request.user;

    var event = {
        'data'       : data,
        'controller' : this
    };

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


Controller.handle = function(action, controllerClass, params) {
    params = params || [];
    return function(req, res, next) {
        var controller = new controllerClass();
        controller.request  = req;
        controller.response = res;
        controller.next     = next;

        if (typeof controller[action] === 'function') {
            controller[action].apply(controller, params);
        } else {
            controller.notfound.apply(controller, params);
        }
    }
}


module.exports = Controller;
