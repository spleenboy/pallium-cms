var util = require('util');
var plugins = require('../../services/plugins');
var Field = plugins.require('models/fields/field');
var log   = plugins.require('services/log')(module);
var file  = plugins.require('services/file');

function File() {
    this.multipart = true;
    this.multiple  = false;
    Field.call(this);
}

util.inherits(File, Field);

module.exports = File;
