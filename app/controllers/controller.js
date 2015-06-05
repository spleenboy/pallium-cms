var config = plugin('config');
var log = plugin('services/log')(module);
var Definition = plugin('models/entry-definition');
var View = plugin('views/view');

function Controller(req, res, next) {
    this.request  = req;
    this.response = res;
    this.next     = next;
};


/**
 * Send the output of a template¬
**/
Controller.prototype.send = function(name, data) {
    data = this.populate(data);
    var content = View.render(name, data);
    this.response.send(content);
};


Controller.prototype.sendError = function(code, message) {
    var data = {
        code    : code,
        message : message
    };
    this.response.status(code);
    this.response.send(View.render('error', data));
};


Controller.prototype.populate = function(data) {
    data = data || {};

    data.site    = config.get('site');
    data.entries = new Definition(this.request.params.domain);

    data.params = this.request.params;
    data.flash  = this.request.flash();
    data.user   = this.request.user;

    return data;
}


Controller.prototype.notfound = function() {
    res.status(404);
    res.type('txt').send('Not found');
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
