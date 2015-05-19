function Field() {
}


/**
 * Defines getters and setters for the specified property names.
 * These getters and setters are overridable in child classes by using
 * getX and setX methods on the class.
**/
Field.prototype.defineProperties = function(props) {
    for (var key in props) {
        var def    = {
            configurable : true,
            enumerable   : true,
            value        : props[key]
        };

        var name = key[0].toUpperCase() + key.slice(1);

        if (typeof this['get' + name] === 'function') {
            def.get = this['get' + name];
        } else {
            def.get = this.prop.bind(this, key);
        }

        if (typeof this['set' + name] === 'function') {
            def.set = this['set' + name];
        } else {
            def.set = this.prop.bind(this, key);
        }

        Object.defineProperty(this, key, def);
    }
};


Field.prototype.prop = function(key, value) {
    if (value !== undefined) {
        this.properties[key] = value;
    }
    return this.properties[key];
};


Field.create = function(settings) {
   var props = Object.assign({
        type         : 'field',
        name         : null,
        value        : null,
        label        : null,
        validators   : [],
        defaultValue : null,
    }, settings);
    var field = new plugin('models/fields/' + settings.type);
    field.defineProperties(props);
};

module.exports = Field;
