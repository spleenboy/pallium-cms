module.exports = control;

function control(action, controller) {
    return function(req, res, next) {
        var instance = new controller(req, res, next);
        if (action in instance) {
            instance.action();
        } else {
            instance.notfound();
        }
    }
}

control.Controller = function Controller(req, res, next) {
    this.request  = req;
    this.response = res;
    this.next     = next;
};


control.Controller.prototype.notFound = function() {
    res.status(404);
    res.type('txt').send('Not found');
};
