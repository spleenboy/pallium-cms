var assert = require('assert');

describe('FieldFactory', function() {
    var factory, fields;

    before(function() {
        global.plugin = function(name) {
            if (name === 'mockField') {
                function MockField() {
                    this.isMock = true;
                }
                return MockField;
            }
            return require('../../../app/' + name);
        };
        factory = require('../../../app/models/fields/field-factory');
        fields  = require('../../../app/models/fields/');
    });

    describe('create', function() {
        describe('settings', function() {
            it('should default to factory settings', function() {
                var field = factory.create();
                var defaults = factory.defaults;
                for (var key in defaults) {
                    assert(field[key] === defaults[key]);
                }
            });

            it('should allow setting overrides', function() {
                var settings = {
                    type         : 'text',
                    source       : false,
                    name         : 'foo',
                    value        : 'bar',
                    label        : 'Date',
                    attributes   : ['required'],
                    defaultValue : 'bump'
                }
                var field = factory.create(settings);
                for (var key in settings) {
                    assert(field[key] === settings[key]);
                }
            });

            it('should merge settings', function() {
                var settings = {
                    name : 'foo',
                    bar  : 'baz'
                }
                var field = factory.create(settings);
                var defaults = factory.defaults;

                for (var key in defaults) {
                    assert(field[key] === defaults[key]);
                }
                for (var key in settings) {
                    assert(field[key] === settings[key]);
                }
            });
        });

        describe('custom fields', function() {
            // Local subclasses
            var subclasses = ['checkbox', 'file'];
            subclasses.forEach(function(subclass) {
                it('should return a "' + subclass + '" subclass of "Field"', function() {
                    var settings = {type: subclass};
                    var field = factory.create(settings);
                    assert(field instanceof fields[subclass]);
                    assert(field instanceof fields.field);
                });
            });
        });

        describe('plugin fields', function() {
            it('should use a "source" override', function() {
                var field = factory.create({source: 'mockField'});
                assert(field.isMock);
            });
        });
    });
});
