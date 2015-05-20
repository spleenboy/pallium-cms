var util = require('util');
var config = plugin('config');
var Controller = plugin('controllers/controller');
var View = plugin('views/view');

function Entries() {
    this.definitions = config.get('entry');
}

util.inherits(Entries, Controller);

Entries.prototype.definition = function() {
    if ('type' in this.request.params) {
        return this.definitions.types[this.request.params.type];
    }
    return null;
}

Entries.prototype.list = function() {
    var data = {};
    data.definition = this.definition();
    console.info(data);
    this.send('entries/list', data);
};


Entries.prototype.create = function() {
    this.send('entries/create');
};


Entries.prototype.edit = function() {
};


Entries.prototype.save = function() {
};


module.exports = Entries;
