var util = require('util');
var config = plugin('config');
var Controller = plugin('controllers/controller');
var Entry = plugin('models/entry');
var View = plugin('views/view');

function Entries() {
    this.config = config.get('entry');
}

util.inherits(Entries, Controller);


/**
 *¬ Gets the entry definition being used
**/
Entries.prototype.definition = function() {
    return this.config.types[this.request.params.type];
}

Entries.prototype.list = function() {
    this.send('entries/list');
};


Entries.prototype.create = function() {
    var def   = this.definition();
    var entry = new Entry(def);
    entry.prerender();
    this.send('entries/create', {entry: entry});
};


Entries.prototype.edit = function() {
    var def   = this.definition();
    var entry = new Entry(def);
    entry.prerender();
    this.send('entries/edit', {entry: entry});
};


Entries.prototype.save = function() {
    this.response.redirect('back');
};


module.exports = Entries;
