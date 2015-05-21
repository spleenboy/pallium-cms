var config = plugin('config');
var Field  = plugin('models/field');

function Entry(type) {
    this.configure(type);
}


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


Entry.prototype.setFields = function(fieldConfigs) {
    this.fields = {};

    for (var i=0; i<fieldConfigs.length; i++) {
        var field = Field.create(fieldConfigs[i]);
        field.id  = [this.type, field.type].join('-');
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
