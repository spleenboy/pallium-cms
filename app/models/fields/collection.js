var util    = require('util');
var assert  = require('assert');
var _       = require('underscore');
var plugins = require('../../services/plugins');
var log     = plugins.require('services/log')(module);
var Field   = plugins.require('models/fields/field');

function Collection() {
    Field.call(this);

    // When setting the value, trim off any objects that have
    // all empty values
    this.on('setting.value', function(data) {

        // Filter out the empty items
        var filtered = _.filter(data.value, function(item) {
            return _.some(_.values(item), function(value) {
                return value && value.length > 0;
            });
        });

        // Reorder the fields to match with the expected ones
        var fields = this.fields;
        data.value = _.map(filtered, function(item) {
            var fixed = {};
            for (var i=0; i<fields.length; i++) {
                var name = fields[i].name;
                fixed[name] = item[name] || null;
            }
            return fixed;
        });
    });


    // When rendering, replace the fields property
    // with rendered field objects as a sample.
    // Replace the 'values' property with a collection
    this.on('rendering', function(view) {
        var factory = plugins.require('models/fields/field-factory');
        var field   = view.data.field;
        var entry   = field.entry;

        var definitions = _.indexBy(field.fields, 'name');

        var fields = {};
        var items  = [];

        // Create the 'fields' property, a model for a blank entry
        for (var name in definitions) {
            var dfn = definitions[name];
            var subfield = factory.create(dfn, entry);

            // Overwrite the default field name to include the collection hierarchy
            subfield.fieldName = entry.type + '[' + field.name + '][_CLONE_][' + name + ']';

            subfield.output = subfield.render();
            fields[name] = subfield;
        }

        // Populate the 'values'
        for (var i=0; i<field.value.length; i++) {
            var saved = field.value[i];
            var item = [];
            for (var name in saved) {
                var itemField = factory.create(definitions[name], entry);
                itemField.fieldName = entry.type + '[' + field.name + '][' + i + '][' + name + ']';
                itemField.value     = saved[name];
                itemField.output    = itemField.render();
                item.push(itemField);
            }
            items.push(item);
        }

        view.data.field.fields = _.values(fields);
        view.data.field.items  = items;
    });
}

util.inherits(Collection, Field);

module.exports = Collection;
