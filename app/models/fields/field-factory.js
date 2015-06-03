var util   = require('util');
var log    = plugin('services/log')(module);
var file   = plugin('services/file');
var object = plugin('util/object');
var fields = plugin('models/fields/');

function FieldFactory() {}

FieldFactory.prototype.defaults = function() {
    return {
        type         : 'text',
        source       : null,
        name         : null,
        value        : null,
        label        : null,
        attributes   : [],
        defaultValue : null
    };
}

/**
 * Factory method for creating a new Field instance
 * based on the settings specified
**/
FieldFactory.prototype.create = function create(settings, entry) {

    var field;
    settings = object.assign(this.defaults(), settings || {});

    if (settings.source) {
        var PluginField = plugin(settings.source);
        field = new PluginField();
    } else if (settings.type in fields) {
        var CustomField = fields[settings.type];
        field = new CustomField();
    } else {
        field = new fields.field();
    }

    object.defineProperties(field, settings);

    field.id        = file.slug(entry.type + '-' + field.name);
    field.entryType = entry.type;
    field.fieldName = entry.type + '[' + field.name + ']';

    return field;
};

module.exports = new FieldFactory();
