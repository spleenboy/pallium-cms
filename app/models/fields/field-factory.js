var util   = require('util');
var events = require('events');
var log    = plugin('services/log')(module);
var file   = plugin('services/file');
var object = plugin('util/object');
var fields = plugin('models/fields/');

function FieldFactory() {
    events.EventEmitter.call(this);
}

util.inherits(FieldFactory, events.EventEmitter);

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

    settings = object.assign(this.defaults(), settings || {});

    var event = {
        'settings' : settings,
        'entry'    : entry,
        'field'    : null
    };

    this.emit('creating', event);

    if (settings.source) {
        var PluginField = plugin(settings.source);
        event.field = new PluginField();
    } else if (settings.type in fields) {
        var CustomField = fields[settings.type];
        event.field = new CustomField();
    } else {
        event.field = new fields.field();
    }

    object.defineProperties(event.field, settings);

    event.field.entry     = entry;
    event.field.id        = file.slug(entry.type + '-' + event.field.name);
    event.field.entryType = entry.type;
    event.field.fieldName = entry.type + '[' + event.field.name + ']';

    this.emit('created', event);

    try {
        event.field.validateDefinition();
    } catch (e) {
        console.error("Invalid field definition", settings);
        throw e;
    }

    return event.field;
};

module.exports = new FieldFactory();
