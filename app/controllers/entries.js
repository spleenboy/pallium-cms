var util = require('util');
var object = plugin('services/object');
var Controller = plugin('controllers/controller');
var Entry = plugin('models/entry');
var Factory = plugin('models/entry-factory');
var View = plugin('views/view');

function Entries() {
    Object.defineProperty(this, 'type', {
        get: function() {
            return this.request.params.type;
        }
    });

    object.lazyGet(this, 'factory', function() {
        return new Factory(this.request.params.type);
    });
}

util.inherits(Entries, Controller);


Entries.prototype.list = function() {
    var all = this.factory.all();
    this.send('entries/list', {list: all});
};


Entries.prototype.create = function() {
    var entry = new Entry(this.type);
    entry.prerender();
    this.send('entries/create', {entry: entry});
};


Entries.prototype.edit = function() {
    var id    = this.request.params.id;
    var entry = this.factory.get(id);
    if (!entry) {
        console.error("Invalid entry id", id);
        this.response.redirect('back');
    }
    entry.prerender();
    this.send('entries/edit', {entry: entry});
};


Entries.prototype.save = function() {
    var posted  = this.request.body[this.type];
    var id      = this.request.params.id;
    var entry   = id ? this.factory.get(id) : new Entry(this.type);
    entry.populate(posted);

    // @todo: add validation
    var id = this.factory.save(entry);

    if (id) {
        this.response.redirect('/entries/' + this.type + '/edit/' + id);
    } else {
        this.response.redirect('/entries/' + this.type + '/list');
    }
};


module.exports = Entries;
