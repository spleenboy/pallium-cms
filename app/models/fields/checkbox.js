var util  = require('util');
var Field = plugin('models/fields/field');

function Checkbox() {
    Field.apply(this, arguments);
    Object.defineProperty(this, '_value', {
        enumerable : false,
        writable   : true
    });

    function toBool(event) {
        event.value = !!event.value;
    }

    this.on('setting.value', toBool);
    this.on('getting.value', toBool);
}

util.inherits(Checkbox, Field);

module.exports = Checkbox;
