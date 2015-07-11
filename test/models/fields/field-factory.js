var assert = require('assert');

describe('FieldFactory', function() {
    var factory, fields;

    before(function() {
        var plugins = require('../../../app/services/plugins');
        plugins.override('mockField', {isMock: true});
        factory = require('../../../app/models/fields/field-factory');
        fields  = require('../../../app/models/fields/');
    });

    describe('create', function() {
        describe('settings', function() {
            it('should default to factory settings', function() {
                var field = factory.create({}, {type: 'nonesuch'});
                var defaults = factory.defaults();
                for (var key in defaults) {
                    assert.deepEqual(field[key], defaults[key], key + ' not equal');
                }
            });

            it('should not overwrite defaults', function() {
                var oldType = factory.defaults().type;
                var field = factory.create({type: 'date'});
                assert.deepEqual(oldType, factory.defaults().type);
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
                    assert.deepEqual(field[key], settings[key]);
                }
            });

            it('should merge settings', function() {
                var settings = {
                    name : 'foo',
                    bar  : 'baz'
                }
                var field = factory.create(settings);
                var defaults = factory.defaults();

                for (var key in defaults) {
                    if (!(key in settings)) {
                        assert.deepEqual(field[key], defaults[key], key + ' not equal');
                    } else {
                        assert.notEqual(field[key], defaults[key]);
                    }
                }

                for (var key in settings) {
                    assert.deepEqual(field[key], settings[key], key + ' not equal');
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
                    assert(field instanceof fields[subclass], 'not an instance of ' + subclass);
                    assert(field instanceof fields.field, 'not an instance of Field');
                });
            });
        });

        describe('plugin fields', function() {
            it('should use a "source" override', function() {
                var field = factory.create({source: 'mockField'});
                assert(field.isMock, 'not the expected mock field');
            });
        });
    });
});
