var util   = require('util');
var log    = plugin('services/log');
var object = plugin('util/object');
var fields = plugin('models/fields/');

/**
 * Factory method for creating a new Field instance
 * based on the settings specified
**/
module.exports.create = function create(settings) {

    var field;
    var props = object.assign({
        type         : 'text',
        source       : null,
        name         : null,
        value        : null,
        label        : null,
        validators   : [],
        defaultValue : null,
    }, settings);

    if (settings.source) {
        log.info("Using custom field source", settings.source);
        field = new plugin(settings.source)();
    } else if (settings.type in fields) {
        field = new fields[settings.type]();
    } else {
        field = new fields.field();
    }

    object.defineProperties(field, props);

    return field;
};
