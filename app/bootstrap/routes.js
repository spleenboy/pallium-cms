var events = require('events');
var util   = require('util');
var hooks  = plugin('services/hooks');

function Router(app) {
    events.EventEmitter.call(this);
    hooks.bubble(module, this, ['registering', 'registered']);
    this.register(app);
}

util.inherits(Router, events.EventEmitter);

Router.prototype.register = function(app) {
    this.emit('registering', app);

    app.use('/', plugin('routes/home'));
    app.use('/entry', plugin('routes/entries'));

    this.emit('registered', app);
};

module.exports = function(app) {
    return new Router(app);
};
