var util  = require('util');
var Field = plugin('models/fields/field');

function Checkbox() {
    Field.apply(this, arguments);
    Object.defineProperty(this, '_value', {
        enumerable : false,
        writable   : true
    });
}

util.inherits(Checkbox, Field);


Checkbox.prototype.getValue = function() {
    return this._value === true;
};


Checkbox.prototype.setValue = function(value) {
    this._value = !!value;
};

module.exports = Checkbox;
