var path   = require('path');
var file   = plugin('services/file');
var config = plugin('config');
var Field  = plugin('models/field');

function Entry(type) {
    this.configure(type);
    this.id = null;
}

Entry.extension = '.md';


Entry.prototype.configure = function(type) {
    this.type    = type;
    this.basekey = 'entry.types.' + type;
    var settings = config.get(this.basekey, this);

    if (!settings) {
        console.error("No configuration file for type", this.basekey);
        throw new Error("No configuration");
    }

    this.loadFields();

    for (var key in settings) {
        if (key !== 'fields') {
            this[key] = this.get(key);
        }
    }
};


// Gets the configuration setting for the specified key
Entry.prototype.get = function(key) {
    var fullkey = this.basekey + '.' + key;
    var value = config.get(fullkey, this);
    if (value === undefined) {
        console.error("Could not find value for key", fullkey);
    }
    return value;
};


Entry.prototype.loadFields = function() {
    var fieldConfigs = this.get('fields');

    if (!fieldConfigs) {
        console.error("No field configuration for type", this.basekey);
        throw new Error("No fields in configuration");
    }

    this.fields = {};

    for (var i=0; i<fieldConfigs.length; i++) {
        var field = Field.create(fieldConfigs[i]);

        field.id        = this.type + field.name;
        field.entryType = this.type;
        field.fieldName = this.type + '[' + field.name + ']';

        this.fields[field.name] = field;
    }
};


// Gets the relative path from this entrys directory, based on its config
Entry.prototype.getRelativePath = function() {

    var title = this.getTitle();

    if (!title) {
        console.error("Config for entry type is missing a title key", this.type);
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


/**
 * Populates the values in the fields from a data dictionary
**/
Entry.prototype.populate = function(data) {
    for (var key in this.fields) {
        if (key in data) {
            this.fields[key].value = data[key];
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
        console.error("Fields array is missing!", this);
        throw new Error("Entry not configured. Fields are missing.");
    }

    if (!this.fields[name]) {
        console.info("Key doesn't exist in fields", name);
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
