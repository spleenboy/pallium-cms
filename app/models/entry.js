var path   = require('path');
var file   = plugin('services/file');
var log    = plugin('services/log')(module);
var config = plugin('config');
var fieldFactory = plugin('models/fields/field-factory');

function Entry(type, definition) {
    this.configure(type, definition);
    this.id = null;
}

Entry.extension = '.md';


Entry.prototype.configure = function(type, definition) {
    this.type       = type;
    this.definition = definition;

    if (!definition || !definition.types) {
        log.error('Invalid definition for entry', type, definition);
        throw new TypeError('Invalid definition');
    }

    var settings = definition.types[type];

    if (!settings) {
        log.error('No definition found for type', type, definition);
        throw new Error("No configuration");
    }

    this.loadFields();

    for (var key in settings) {
        if (key !== 'fields') {
            this[key] = settings[key];
        }
    }
};


// Gets the configuration setting for the specified key
Entry.prototype.get = function() {

    var keys = Array.prototype.slice.call(arguments);
    keys.unshift('types', this.type);

    var value = this.definition.get(keys, this);

    if (value === undefined) {
        log.info("Could not find value for key", keys);
    }
    return value;
};


Entry.prototype.loadFields = function() {
    var fieldConfigs = this.get('fields');

    if (!fieldConfigs) {
        log.error("No field configuration for type", this.type);
        throw new Error("No fields in configuration");
    }

    this.fields = {};

    for (var i=0; i<fieldConfigs.length; i++) {
        var field = fieldFactory.create(fieldConfigs[i]);

        field.id        = file.slug(this.type + '-' + field.name);
        field.entryType = this.type;
        field.fieldName = this.type + '[' + field.name + ']';

        this.fields[field.name] = field;
    }

};


// Gets the relative path from this entrys directory, based on its config
Entry.prototype.getRelativePath = function() {

    var title = this.getTitle();

    if (!title) {
        log.error("Config for entry type is missing a title key", this.type);
        throw new Error("Configuration file missing title key");
    }

    var name = file.slug(title) + Entry.extension;
    var sub  = this.get('subdirectory');

    if (sub === undefined) {
        return name;
    }

    return path.join(sub, name);
};


// Gets this entry's title based on its config
Entry.prototype.getTitle = function() {
    return this.get('title');
};


// Gets this entry's subtitle based on its config
Entry.prototype.getSubtitle = function() {
    var st = this.get('subtitle');
    return st !== undefined ? st : '';
};


/**
 * Populates the values in the fields from a data dictionary
**/
Entry.prototype.populate = function(data) {
    for (var key in this.fields) {
        if (key in data) {
            this.fields[key].value = data[key];
        } else {
            var defaultValue = this.fields[key].defaultValue;
            if (typeof defaultValue === 'function') {
                this.fields[key].value = defaultValue.call(this);
            } else {
                this.fields[key].value = defaultValue;
            }
        }
    }
};


/**
 * Works like jQuery.data 
 *  - NO arguments  - get all key/value pairs
 *  - ONE argument  - get the value for the specified key
 *  - TWO arguments - set the value for the specified key
**/
Entry.prototype.data = function(name, value) {
    if (name === undefined) {
        var values = {};
        for (var key in this.fields) {
            values[key] = this.fields[key].value;
        }
        return values;
    }

    if (!this.fields) {
        log.error("Fields array is missing!", this);
        throw new Error("Entry not configured. Fields are missing.");
    }

    if (!this.fields[name]) {
        log.info("Key doesn't exist in fields", name);
        return undefined;
    }

    if (value !== undefined) {
        this.fields[name].value = value;
    }

    return this.fields[name].value;
};


Entry.prototype.prerender = function(data) {
    for (var key in this.fields) {
        var field = this.fields[key];
        if (data && key in data) {
            field.value = data[key];
        } else if (field.value === undefined) {
            field.value = field.defaultValue;
        }
        field.html = field.render();
    }
};

module.exports = Entry;
