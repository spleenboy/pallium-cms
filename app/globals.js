module.exports = function(app) {
    var path = require('path');

    global.appRequire = function(name) {
        var file = path.join(__dirname, name);
        return require(file);
    }
};
