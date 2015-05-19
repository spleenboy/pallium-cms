var util = require('util');
var control = plugin('controllers/control');

function Entries(res, req, next) {}


Entries.prototype.list = function() {
};


Entries.prototype.create = function() {
};


Entries.prototype.edit = function() {
};


Entries.prototype.save = function() {
};


module.exports = util.inherits(Entries, control.Controller);
