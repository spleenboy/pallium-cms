var util  = require('util');
var Field = plugin('models/fields/field');

function Hidden() {
    Field.apply(this, arguments);
    Object.defineProperty(this, '_value', {
        enumerable : false,
        writable   : true
    });

    this.on('getting.value', function(event) {
        if (typeof event.value === 'function') {
            event.value = event.value.call(this);
        }
    });
}

util.inherits(Hidden, Field);

module.exports = Hidden;
