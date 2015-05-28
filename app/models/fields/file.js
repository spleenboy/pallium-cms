var util = require('util');
var Field = plugin('models/fields/field');

function File() {
    Field.call(this);
}

util.inherits(File, Field);

module.exports = File;
