var util   = require('util');
var log    = plugin('services/log')(module);
var object = plugin('util/object');
var fields = plugin('models/fields/');

module.exports.defaults = {
    type         : 'text',
    source       : null,
    name         : null,
    value        : null,
    label        : null,
    attributes   : [],
    defaultValue : null
};

/**
 * Factory method for creating a new Field instance
 * based on the settings specified
**/
module.exports.create = function create(settings) {

    var field;
    settings = object.assign(module.exports.defaults, settings || {});

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

    return field;
};
