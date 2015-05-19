var util = require('util');
var Field = plugin('models/field');

function TextField() {

}

util.inherit(TextField, Field);

module.exports = TextField;
