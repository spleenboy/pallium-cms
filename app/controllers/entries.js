var util        = require('util');
var moment      = require('moment');
var object      = plugin('util/object');
var Controller  = plugin('controllers/controller');
var Entry       = plugin('models/entry');
var Factory     = plugin('models/entry-factory');
var View        = plugin('views/view');

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


Entries.prototype.redirect = function() {
    var parts = Array.prototype.slice.call(arguments);
    parts.unshift('entry', this.type);
    var url = '/' + parts.join('/');
    console.info("Redirecting to", url);
    this.response.redirect(url); 
};


Entries.prototype.list = function() {
    var all = this.factory.all();
    var items = [];
    for (var id in all) {
        var item = all[id];
        item.createdFromNow  = moment(item.created).fromNow();
        item.modifiedFromNow = moment(item.modified).fromNow();
        items.push(item);
    }

    // Handle single entry types
    if (this.factory.model.maximum === 1) {
        var item = items.shift();
        if (item) {
            return this.redirect('edit', item.id);
        } else {
            return this.redirect('create');
        }
    }

    items.sort(function(a, b) {
        return b.modified - a.modified;
    });

    this.send('entries/list', {list: items});
};


Entries.prototype.create = function() {
    var entry = this.factory.create();
    entry.prerender();
    this.send('entries/create', {entry: entry});
};


Entries.prototype.edit = function() {
    var id    = this.request.params.id;
    var entry = this.factory.get(id);
    if (!entry) {
        console.error("Can't edit. Invalid entry id", id);
        this.response.redirect('back');
    }
    entry.prerender();
    this.send('entries/edit', {entry: entry});
};


Entries.prototype.save = function() {
    var posted = this.request.body[this.type];
    var id     = this.request.params.id;
    var entry  = id ? this.factory.get(id) : new Entry(this.type);

    console.info("Populating with posted data", posted);
    entry.populate(posted);

    var id = this.factory.save(entry);

    this.request.flash('info', '"' + entry.getTitle() + '" saved!');

    if (id) {
        this.redirect('edit', id);
    } else {
        this.redirect('list');
    }
};


Entries.prototype.delete = function() {
    var id = this.request.params.id;
    var item = this.factory.delete(id);

    if (item) {
        this.request.flash('info', '"' + item.title + '" was deleted!');
    } else {
        this.request.flash('error', '"' + item.title + '" could not be deleted!');
    }

    this.redirect('list');
};


module.exports = Entries;
