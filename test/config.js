var assert = require('assert');

describe('config', function() {
    var config, mockSource;

    before(function() {
        global.plugin = function(name) {
            mockSource = {mock: 'duck'};
            if (name === 'config/mockSource') {
                return mockSource;
            }
            return require('../app/' + name);
        };
        config = require('../app/config');
    });

    describe('local', function() {
        it('should return undefined for missing local file', function() {
            var wacky = 'wacky-undefined-local-file';
            assert.equal(config.local(wacky), undefined);
        });
    });


    describe('localPath', function() {
        it('should generate a full path', function() {
            var expect = process.cwd() + '/config/foo';
            var actual = config.localPath('foo');
            assert.equal(expect, actual);
        });
    });


    describe('get', function() {
        it('should throw an error when the namespacedKey is empty', function() {
            assert.throws(config.get(''), Error);
        });

        it('should return a value from a local source', function() {
            assert.equal(config.get('mockSource.mock'), 'duck');
        });

        it('should return undefined when given a bad key', function() {
            assert.equal(config.get('mockSource.bar.baz'), undefined);
        });

        it('should return something for the site title', function() {
            assert.notEqual(config.get('site.title'), undefined);
        });
    });


    describe('resolve', function() {
        it('should return undefined when source is undefined', function() {
            var value = config.resolve(undefined, []);
            assert.equal(value, undefined);
        });

        it('should allow a single key', function() {
            var source = {foo: 'bar'};
            var value = config.resolve(source, 'foo');
            assert.equal(value, source.foo);
        });

        it('should return a nested value', function() {
            var source = {foo: {bar: 'baz'}};
            var keys   = ['foo', 'bar'];
            var value  = config.resolve(source, keys);
            assert.equal(value, source.foo.bar);
        });

        it('should return undefined for a missing nested value', function() {
            var source = {foo: {bar: 'baz'}};
            var keys   = ['foo', 'quz'];
            var value  = config.resolve(source, keys);
            assert.equal(value, undefined);
        });

        it('should resolve a function to a value', function() {
            var source = {foo: function() {return 'bar';}};
            var value  = config.resolve(source, 'foo');
            assert.equal(value, 'bar');
        });

        it('should use context to resolve a function', function() {
            var context = {name: 'bar'};
            var source  = {foo: function() {return this.name;}};
            var value   = config.resolve(source, 'foo', context);
            assert.equal(value, 'bar');
        });

        it('should use arguments to resolve a function', function() {
            var context = {name: 'bar'};
            var source  = {foo: function(and) {return this.name + and;}};
            var value   = config.resolve(source, 'foo', context, ['baz']);
            assert.equal(value, 'barbaz');
        });

        it('should convert one argument to an array', function() {
            var context = {name: 'bar'};
            var source  = {foo: function(and) {return this.name + and;}};
            var value   = config.resolve(source, 'foo', context, 'baz');
            assert.equal(value, 'barbaz');
        });

        it('should use the config object as context when one is not specified', function() {
            var source = {
                name: 'bar',
                foo: function() {
                    return this.name;
                }
            };
            var value = config.resolve(source, 'foo');
            assert.equal(value, 'bar');
        });
    });
});
