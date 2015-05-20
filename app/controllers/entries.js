var util = require('util');
var config = plugin('config');
var Controller = plugin('controllers/controller');
var View = plugin('views/view');

function Entries() {
    this.definitions = config.get('entry');
}

util.inherits(Entries, Controller);

Entries.prototype.list = function() {
    this.send('entries/list');
};


Entries.prototype.create = function() {
    this.send('entries/create');
};


Entries.prototype.edit = function() {
};


Entries.prototype.save = function() {
};


module.exports = Entries;
