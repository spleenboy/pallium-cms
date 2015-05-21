var util = require('util');
var Controller = plugin('controllers/controller');
var Entry = plugin('models/entry');
var View = plugin('views/view');

function Entries() {
    Object.defineProperty(this, 'type', {
        get: function() {
            return this.request.params.type;
        }
    });
}

util.inherits(Entries, Controller);


Entries.prototype.list = function() {
    this.send('entries/list');
};


Entries.prototype.create = function() {
    var entry = new Entry(this.type);
    entry.prerender();
    this.send('entries/create', {entry: entry});
};


Entries.prototype.edit = function() {
    var entry = new Entry(this.type);
    entry.prerender();
    this.send('entries/edit', {entry: entry});
};


Entries.prototype.save = function() {
    this.response.redirect('back');
};


module.exports = Entries;
