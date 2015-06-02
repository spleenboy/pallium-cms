var util = require('util');
var Field = plugin('models/fields/field');
var log   = plugin('services/log')(module);
var file  = plugin('services/file');

function File() {
    Field.call(this);
    this.multipart = true;
}

util.inherits(File, Field);

module.exports = File;
