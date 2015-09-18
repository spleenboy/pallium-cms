var util = require('util');
var path = require('path');

var plugins = require('./services/plugins');
var log     = plugins.require('services/log')(module);

module.exports = {

debug: true,

localRoot: null,

setLocalRoot: function(rootDir) {
    rootDir = path.normalize(rootDir);
    if (path.resolve(rootDir) !== rootDir) {
        rootDir = path.join(process.cwd(), rootDir);
    }
    this.localRoot = rootDir;
},

localPath: function(name) {
    if (!this.localRoot) {
        this.localRoot = path.join(process.cwd(), 'config');
    }
    return path.join(this.localRoot, name);
},

/**
 * Loads the full local and default configuration settings.
**/
local: function(name) {
    var localPath = this.localPath(name);
    try {
        var localConf = require(localPath);
        return localConf;
    } catch (e) {
        if (this.debug) {
            log.debug('No local config override at', localPath, e);
        }
        return undefined;
    }
},

/**
 * Gets a config value. All configuration keys should include at least two parts.
 * The first is the namespace, which maps to a file name in the config directory.
 * The second is the key for the configuration setting. This key may include additional
 * dot-spaced steps.
 *
 * This method first checks for any local configuration settings and 
 * then uses the defaults.
 *
 * For example:
 *
 * config.get('site.title');
**/
get: function(namespacedKey, context, args) {
    var keys = namespacedKey.split('.');
    if (keys.length < 1) {
        throw new Error('Invalid configuration key');
    }
    var file = keys.shift();
    var source = {};

    // Think locally first
    source = this.local(file);
    var value = this.resolve(source, keys, context, args);

    // Now think globally
    if (value === undefined) {
        source = plugins.require(path.join('config', file));
        value = this.resolve(source, keys, context, args);
    }

    if (value === undefined) {
        return undefined;
    }

    return value;
},

/**
 * Recursively hunt for a value in an object. If that value is a function,
 * resolve it using the specified context.
**/
resolve: function(source, keys, context, args) {
    if (source === undefined) {
        return undefined;
    }

    if (util.isArray(keys)) {
        keys = keys.slice(); // Prevent byref manipulation of the array
    } else {
        keys = [keys];
    }

    if (args && !util.isArray(args)) {
        args = [args];
    }

    var value = source;
    var key;

    while (key = keys.shift()) {
        value = value && key in value ? value[key] : undefined;
    }

    if (typeof value === 'function') {
        return value.apply(context || source, args || []);
    }

    return value;
}

};
