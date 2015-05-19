function control(action, withController, params) {
    params = params || [];
    return function(req, res, next) {
        var controller = new withController();
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

control.Controller = function () {};


control.Controller.prototype.notfound = function() {
    res.status(404);
    res.type('txt').send('Not found');
};


module.exports = control;
