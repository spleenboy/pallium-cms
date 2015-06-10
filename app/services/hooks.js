var events = require('events');
var path   = require('path');
var util   = require('util');
var log    = plugin('services/log')(module);

// Singleton hooks instance used for application-level events
function Hooks() {
    events.EventEmitter.call(this);
}

util.inherits(Hooks, events.EventEmitter);


Hooks.prototype.namespace = function(module) {
    var relative = path.relative(process.cwd(), module.filename);
    return relative.replace('.js', '');
};


// Observes an event emitter and bubbles up the specified events
// through this instance
Hooks.prototype.bubble = function(module, emitter, events) {

    var namespace = this.namespace(module);

    events.forEach(function(event) {
        var key = path.join(namespace, event);

        function emitted() {
            var args = Array.prototype.slice.call(arguments);
            args.unshift(key);
            this.emit.apply(this, args);
        }

        log.debug('Bubbling up event', event, 'as', key);
        emitter.on(event, emitted.bind(this));
    }, this);
};

module.exports = new Hooks();
