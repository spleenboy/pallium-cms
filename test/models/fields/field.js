var assert = require('assert');

describe('Field', function() {
    var Field, field, mockView;

    before(function() {
        mockView = {
            render : function(name, data) {
                 // stub!
            }
        };
        global.plugin = function(name) {
            if (name === 'views/View') {
                return mockView;
            }
            return require('../../../app/' + name);
        };
        Field = require('../../../app/models/fields/field');
    });

    beforeEach(function() {
        field = new Field();
    });

    describe('properties', function() {
        var nulls = ['id', 'entryType', 'fieldName'];

        nulls.forEach(function(key) {
            it(key + ' should be null', function() {
                assert(field[key] === null);
            });
        });
    });

    describe('render', function() {

        it('should use the right template', function() {
            field.type = 'text';
            mockView.render = function(name, data) {
                assert(name === 'fields/text');
            };
            field.render();
        });

        it('should include the field as data', function() {
            field.type = 'text';
            mockView.render = function(name, data) {
                assert(data.field === field);
            };
            field.render();
        });

        it('should include extra data', function() {
            field.type = 'text';
            mockView.render = function(name, data) {
                assert(data.foo === 'bar');
            };
            field.render({foo: 'bar'});
        });

        it('should throw a type error with a null field', function() {
            assert.throws(field.render, TypeError);
        });
    });
});
