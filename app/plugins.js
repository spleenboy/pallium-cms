var fs = require('fs');
var path = require('path');
var config = plugin('config');

module.exports = function(app, args) {
    var dir = config.get('site.pluginDirectory');

    if (!fs.statSync(dir).isDirectory) {
        console.error("Invalid plugin directory", dir);
        throw new Error("Invalid plugin directory");
    }

    var plugins = fs.readdirSync(dir);

    if (!plugins) {
        return;
    }

    for (var i=0; i<plugins.length; i++) {

        if (!fs.statSync(plugins[i]).isDirectory) {
            continue;
        }

        try {
            var main = require(path.join(plugins[i], 'register'))();
            console.info("Registered plugin", plugins[i]);
        } catch (e) {
            console.error("Plugin missing register.js file", plugins[i]);
            throw e;
        }
    }
};
