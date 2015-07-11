var assert  = require('assert');
var path    = require('path');

var pluginsModule = '../app/services/plugins';

describe('plugins', function() {
    var plugins;

    before(function() {
        global.plugin = function(name) {
            return require('../app/' + name);
        };
        plugins = require(pluginsModule);
    });

    describe('find', function() {
        it('should find a registered override', function() {
            plugins.override('foo', 'bar');
            assert.equal(plugins.find('foo'), 'bar');
        });

        it('should find a default', function() {
            var pluginsPath = path.resolve(__dirname, pluginsModule);
            assert.equal(plugins.find(pluginsModule), pluginsPath);
        });
    });

    describe('global.plugin', function() {
        it('should register a global plugin method', function() {
            assert.equal(typeof global.plugin, 'function');
        });
    });
});
