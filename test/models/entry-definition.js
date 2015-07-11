var assert = require('assert');

describe('EntryDefinition', function() {
    function makeDefinition(domain, data) {
        var Definition = require('../../app/models/entry-definition');
        return new Definition(domain, data);
    }

    describe('properties', function() {
        var definition = makeDefinition(null, {});
        var properties = Object.keys(definition);
        var expected   = ['name', 'output', 'types', 'domains'];

        expected.forEach(function(name) {
            it('should define ' + name + ' as enumerable', function() {
                assert(properties.indexOf(name) >= 0);
            });
        });
    });

    describe('without domains', function() {
        var data = {
            name: 'Without',
            output: function() {return 'dir'},
            types: {'todo': {}}
        }
        var def = makeDefinition(null, data);

        it('should include name', function() {
            assert.equal(def.name, data.name);
        });

        it('should include output', function() {
            assert.equal(def.output, data.output());
        });

        it('should include types', function() {
            assert.deepEqual(def.types, data.types);
        });

        it('should not include domains', function() {
            assert.equal(def.domains, undefined);
        });
    });


    describe('with domains', function() {
        var data = {
            domains: {
                foo: {
                    name   : 'Foo',
                    output : 'foop',
                    types  : {'foo': {}}
                },
                bar: {
                    name   : 'Bar',
                    output : 'boop',
                    types  : {'bar': {}}
                }
            }
        }
        var def = makeDefinition(null, data);

        it('should default to the first domain when the domain name is empty', function() {
            assert.equal(def.name, 'Foo');
            assert.equal(def.output, 'foop');
            assert.deepEqual(Object.keys(def.types), ['foo']);
        });


        it('should default to the first domain when the domain is invalid', function() {
            def.domain = 'baz';
            assert.equal(def.name, 'Foo');
            assert.equal(def.output, 'foop');
            assert.deepEqual(Object.keys(def.types), ['foo']);
        });


        it('should use the specified domain', function() {
            def.domain = 'bar';
            assert.equal(def.name, 'Bar');
            assert.equal(def.output, 'boop');
            assert.deepEqual(Object.keys(def.types), ['bar']);
        });


        it('should return the domains', function() {
            var domains = def.domains;
            assert.deepEqual(Object.keys(domains), ['foo', 'bar']);
        });
    });

    describe('get', function() {
        var data = {
            name   : 'Foo',
            output : function() {
                return this.name;
            }
        }
        var def = makeDefinition(null, data);

        it('should use itself as context by default', function() {
            assert.equal(def.get('output'), data.name);
            assert.equal(def.output, data.name);
        });

        it('should use the passed context', function() {
            var ctx = {name: 'Bar'};
            assert.equal(def.get('output', ctx), 'Bar');
        });
    });
});
