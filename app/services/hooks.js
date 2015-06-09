var events = require('events');
var path   = require('path');
var util   = require('util');

// Singleton hooks instance used for application-level events
function Hooks() {
    events.EventEmitter.call(this);
}

util.inherits(Hooks, events.EventEmitter);


// Observes an event emitter and bubbles up the specified events
// through this instance
Hooks.prototype.bubble = function(module, emitter, events) {
    var namespace = module.filename;
    events.forEach(function(event) {
        var key     = path.join(namespace, event);
        var trigger = this.emit.bind(emitter, key);
        emitter.on(event, trigger);
    }, this);
};

module.exports = new Hooks();
