var assert  = require('assert');
var path    = require('path');

var pluginsModule = '../app/bootstrap/plugins';

describe('plugins', function() {
    var plugins;

    before(function() {
        global.plugin = function(name) {
            return require('../app/' + name);
        };
        plugins = require(pluginsModule);
    });

    describe('register', function() {
        it('should find a registered override', function() {
            plugins.register('foo', 'bar');
            assert.equal(plugins.find('foo'), 'bar');
        });

        it('should find a default', function() {
            var pluginsPath = path.resolve(__dirname, pluginsModule);
            assert.equal(plugins.find(pluginsModule), pluginsPath);
        });
    });
});
