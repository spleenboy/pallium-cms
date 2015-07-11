var util  = require('util');
var plugins = require('../../services/plugins');
var Field = plugins.require('models/fields/field');

function Hidden() {
    Field.apply(this, arguments);

    this.on('setting.value', function(event) {
        if (event.value === undefined || event.value === null) {
            event.value = this.defaultValue;
        }
    });
}

util.inherits(Hidden, Field);

module.exports = Hidden;
