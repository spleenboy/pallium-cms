var Field = plugin('models/field');

function Entry(config) {
    this.setProperties(config);
}


Entry.prototype.setProperties = function(config) {
    if (!config) {
        return;
    }

    for (var key in config) {
        if (key === 'fields') {
            this.setFields(config.fields);
        } else {
            this[key] = config[key];
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
