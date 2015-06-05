var util = require('util');
var Field = plugin('models/fields/field');
var log   = plugin('services/log')(module);
var file  = plugin('services/file');

function File() {
    this.multipart = true;
    this.multiple  = false;
    Field.call(this);
}

util.inherits(File, Field);

module.exports = File;
