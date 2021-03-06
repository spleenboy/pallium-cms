var fs = require('fs');
var path = require('path');

var plugins = {};

plugins.overrides = {};


// Finds either a registered override or the default module
plugins.find = function find(name) {
    if (name in plugins.overrides) {
        return plugins.overrides[name];
    }

    return path.join(process.cwd(), 'app', name);
};


plugins.require = function (name) {
    var found = plugins.find(name);
    if (typeof found === 'function') {
        found = found();
    }
    if (typeof found === 'object') {
        return found;
    }
    if (typeof found !== 'string') {
        throw new Error('Invalid require for ' + name);
    }
    return require(plugins.find(name));
};


plugins.override = function overrride(name, pathOrFunction) {
    var log = plugins.require('services/log')(module);
    if (name in plugins.overrides) {
        log.warn("Plugin override already exists for", name);
    }
    var overrideType = typeof pathOrFunction;
    if (['function', 'string', 'object'].indexOf(overrideType) < 0) {
        throw new TypeError('Invalid override type for ' + name);
    }
    plugins.overrides[name] = pathOrFunction;
};


plugins.load = function load(app, args) {
    var file   = plugins.require('services/file');
    var config = plugins.require('config');
    var log    = plugins.require('services/log')(module);
    var hooks  = plugins.require('services/hooks');

    if (args.config) {
        config.setLocalRoot(args.config);
        log.debug('Set config root from argument', args.config);
    } else if (process.env.PALLIUM_CONFIG) {
        config.setLocalRoot(process.env.PALLIUM_CONFIG);
        log.debug('Set config root from environment', process.env.PALLIUM_CONFIG);
    }

    var dir   = config.get('site.plugins.directory');
    var stats = file.stats(dir);

    if (!stats || !stats.isDirectory) {
        log.error("Invalid plugin directory", dir);
        return;
    }

    var list = config.get('site.plugins.enabled');

    if (!list) {
        return;
    }

    for (var i=0; i<list.length; i++) {

        var pluginPath = path.join(dir, list[i]);

        if (list[i][0] === '.') {
            // Ignore dot-prefixed files and directories
            continue;
        }

        var stats = file.stats(pluginPath);

        if (!stats.isDirectory) {
            // Ignore non-directories
            continue;
        }

        var pluginPath = path.join(dir, list[i]);
        try {
            var main = require(pluginPath)(hooks, app);
            log.info("Registered plugin", list[i]);
        } catch (e) {
            log.error("Plugin missing index.js file", list[i], pluginPath, e);
        }
    }
};

module.exports = plugins;
