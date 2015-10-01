var plugins = require('./plugins');
var log     = plugins.require('services/log')(module);

/**
 * The future service is a singleton that manages
 * timeout events. ¬
**/

function Future() {
    this.events = {};
}

Future.prototype.schedule = function(key, action, ms) {
    this.cancel(key);

    var execute = function() {
        action();
        delete(this.events[key]);
        log.debug('Executed scheduled action for', key);
    }

    this.events[key] = setTimeout(execute.bind(this), ms);
}

Future.prototype.cancel = function(key) {
    if (key in this.events) {
        clearTimeout(this.events[key]);
        delete(this.events[key]);
        log.debug('Cleared action for', key);
    }
}

module.exports = new Future();
