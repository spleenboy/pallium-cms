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
    return require(plugins.find(name));
};


plugins.register = function register(name, path) {
    var log = plugins.require('services/log');
    if (name in plugins.overrides) {
        log.warn("Plugin override already exists for", name);
    }
    plugins.overrides[name] = path;
};


plugins.load = function load(app, args) {
    var file   = plugins.require('services/file');
    var config = plugins.require('config');
    var log    = plugins.require('services/log');

    var dir   = config.get('site.pluginDirectory');
    var stats = file.stats(dir);

    if (!stats || !stats.isDirectory) {
        log.error("Invalid plugin directory", dir);
        return;
    }

    var list = fs.readdirSync(dir);

    if (!list) {
        return;
    }

    for (var i=0; i<list.length; i++) {

        if (!fs.statSync(list[i]).isDirectory) {
            continue;
        }

        try {
            var main = require(path.join(dir, list[i], 'register'))();
            log.info("Registered plugin", list[i]);
        } catch (e) {
            log.error("Plugin missing register.js file", list[i]);
            throw e;
        }
    }
};

module.exports = plugins;
global.plugin  = plugins.require;

