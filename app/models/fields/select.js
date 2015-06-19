var util   = require('util');
var assert = require('assert');
var Field  = plugin('models/fields/field');

function Select() {
    Field.call(this);

    this.on('getting.options', function(event) {
        if (typeof event.value === 'function') {
            event.value = event.value.call(this);
        }
    });
}

util.inherits(Select, Field);


Select.prototype.validateDefinition = function() {
    Select.super_.prototype.validateDefinition.call(this);
    assert(this.options !== undefined);
};

module.exports = Select;
