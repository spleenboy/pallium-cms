var util = require('util');
var Controller = plugin('controllers/controller');
var View = plugin('views/view');

function Entries() {}

util.inherits(Entries, Controller);

Entries.prototype.list = function() {
    var content = View.render('entries/list');
    this.response.send(content);
};


Entries.prototype.create = function() {
};


Entries.prototype.edit = function() {
};


Entries.prototype.save = function() {
};


module.exports = Entries;
