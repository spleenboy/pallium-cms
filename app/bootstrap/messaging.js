var plugins     = require('../services/plugins');
var log         = plugins.require('services/log')(module);
var hooks       = plugins.require('services/hooks');
var Definition  = plugins.require('models/entry-definition');
var Factory     = plugins.require('models/entry-factory');

/**
 *¬This function registers global event listeners and handles
 * broadcasting those events.
**/
module.exports = function(app) {
    hooks.on('app/services/locker/locked', function(lock) {
        log.debug('Broadcasting entry LOCKED', lock.data);
        app.io.broadcast('entry locked', lock.data);
    });

    hooks.on('app/services/locker/unlocked', function(lock) {
        if (!lock.data) {
            log.debug('Lock has no data', lock);
            return;
        }
        log.debug('Broadcasting entry UNLOCKED', lock.data);
        var factory = new Factory(lock.data.type, new Definition(lock.data.domain));
        factory.unlock(lock.data.id);
        app.io.broadcast('entry unlocked', lock.data);
    });
};
