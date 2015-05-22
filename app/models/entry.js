var path   = require('path');
var config = plugin('config');
var Field  = plugin('models/field');

function Entry(type) {
    this.configure(type);
    this.id = null;
}

Entry.extension = '.md';


Entry.prototype.configure = function(type) {
    this.type   = type;
    this.config = config.get('entry.types.' + type, this);

    if (!this.config) {
        return;
    }

    for (var key in this.config) {
        if (key === 'fields') {
            this.setFields(this.config.fields);
        } else {
            this[key] = this.config[key];
        }
    }
};


// Gets this entry's filename based on its config
Entry.prototype.getFilename = function() {
    var sub   = this.config['subdirectory'].call(this);
    var title = this.config['title'].call(this);
    name = title.replace(/([^a-zA-Z0-9]+)/g, '-') + Entry.extension;
    return path.join(sub, title);
};


// Gets this entry's title based on its config
Entry.prototype.getTitle = function() {
    return this.config['title'].call(this);
};


Entry.prototype.setFields = function(fieldConfigs) {
    this.fields = {};

    for (var i=0; i<fieldConfigs.length; i++) {
        var field = Field.create(fieldConfigs[i]);

        field.id        = [this.type, field.type].join('-');
        field.entryType = this.type;
        field.fieldName = this.type + '[' + field.name + ']';

        this.fields[field.name] = field;
    }
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
        if (data) {
            field.value = data[key];
        }
        field.html = field.render();
    }
};

module.exports = Entry;
