// Registers all global functions
module.exports = function(app, args) {
    var path = require('path');

    global.overrides = {};

    // A special 'require.' This method first looks to see if a
    // plugin has registered an override for the required script.
    // If not, it uses the './app' directory as the base location 
    // for the require statement.
    global.plugin = function(name) {
        if (name in overrides) {
            return require(overrides[name]);
        }

        var local = path.join(__dirname, name);
        return require(local);
    }
};
