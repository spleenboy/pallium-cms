var config = plugin('config');
var View = plugin('views/view');

function Controller() {};


/**
 * Send the output of a template¬
**/
Controller.prototype.send = function(name, data) {
    var view   = new View(name);

    // Add global values
    data         = data         || {};
    data.site    = data.site    || config.get('site');
    data.entries = data.entries || config.get('entry');

    console.info('Rendering view', name, 'with', data);

    var content = View.render(name, data);
    this.response.send(content);
};


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
