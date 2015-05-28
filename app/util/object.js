var log = plugin('services/log');

/**
 * Recursively copy into an object.
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/assign
**/
module.exports.assign = function assign(target, firstSource) {
    if (target === undefined || target === null) {
        log.error("Invalid assign target", target);
        throw new TypeError('Cannot convert first argument to object');
    }

    var to = Object(target);
    for (var i = 1; i < arguments.length; i++) {
        var nextSource = arguments[i];
        if (nextSource === undefined || nextSource === null) {
            continue;
        }
        nextSource = Object(nextSource);

        var keysArray = Object.keys(Object(nextSource));
        for (var nextIndex = 0, len = keysArray.length; nextIndex < len; nextIndex++) {
            var nextKey = keysArray[nextIndex];
            var desc = Object.getOwnPropertyDescriptor(nextSource, nextKey);
            if (desc !== undefined && desc.enumerable) {
                to[nextKey] = nextSource[nextKey];
            }
        }
    }
    return to;
}

/**
 * Creates a lazy-get property on the object
**/
module.exports.lazyGet = function lazyGet(obj, property, getter) {

    var hidden = '_' + property;

    Object.defineProperty(obj, hidden, {
        enumerable   : false,
        writable     : true
    });

    var def = {
        enumerable   : true,
        get : function() {
            if (this[hidden] === undefined) {
                var value = getter.call(obj);
                this[hidden] = value;
            }
            return this[hidden];
        }
    };

    Object.defineProperty(obj, property, def);
};

/**
 * Defines getters and setters for the specified property names.
 * These getters and setters are overridable in child classes by using
 * getX and setX methods on the class.
**/
module.exports.defineProperties = function defineProperties(obj, properties) {
    Object.defineProperty(obj, '_properties', {
        enumerable   : false,
        writable     : true,
        value        : {}
    });

    function prop(key, value) {
        if (value !== undefined) {
            this._properties[key] = value;
        }
        return this._properties[key];
    }

    for (var key in properties) {
        var def    = {
            configurable : true,
            enumerable   : true
        };

        var name = key[0].toUpperCase() + key.slice(1);

        if (typeof obj['get' + name] === 'function') {
            def.get = obj['get' + name];
        } else {
            def.get = prop.bind(obj, key);
        }

        if (typeof obj['set' + name] === 'function') {
            def.set = obj['set' + name];
        } else {
            def.set = prop.bind(obj, key);
        }

        Object.defineProperty(obj, key, def);

        obj[key] = properties[key];
    }
};
