var path = require('path');

module.exports = {

/**
 *¬Loads the full local and default configuration settings.
**/
local: function(name) {
    var localName = path.join(process.cwd(), 'config', name + '.local');
    try {
        return require(localName);
    } catch (e) {
        return null;
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
get: function(namespacedKey) {
    var keys = namespacedKey.split('.');
    if (keys.length < 2) {
        throw new Error('Invalid configuration key');
    }
    var file = keys.shift();

    // Think locally first
    var local = this.local(file);
    var value = this.find(local, keys);

    // Now think globally
    if (value === undefined) {
        var config = appRequire(path.join('config', file));
        value = this.find(config, keys);
    }

    return typeof value === 'function' ? value() : value;
},

/**
  *¬Recursively hunt for a value in an object
**/
find: function(obj, keys) {
    if (!obj) {
        return undefined;
    }

    keys = keys.slice(); // Prevent byref manipulation
    var key = keys.shift();
    var value = obj[key];

    while (key = keys.shift()) {
        value = value && key in value ? value[key] : undefined;
    }

    return value;
}

};
