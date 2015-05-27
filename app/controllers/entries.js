var util        = require('util');
var moment      = require('moment');
var object      = plugin('services/object');
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
    var entry = new Entry(this.type);
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
        this.response.redirect('/entry/' + this.type + '/edit/' + id);
    } else {
        this.response.redirect('/entry/' + this.type + '/list');
    }
};


module.exports = Entries;
