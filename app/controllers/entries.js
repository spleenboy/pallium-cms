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
    var filepath = this.request.params.filepath;
    var entry    = this.factory.get(filepath);
    if (!entry) {
        console.error("Invalid entry path", filepath);
        this.response.redirect('back');
    }
    entry.prerender();
    this.send('entries/edit', {entry: entry});
};


Entries.prototype.save = function() {
    var posted  = this.request.body[this.type];
    var oldpath = this.request.params.filepath;
    var entry   = oldpath ? this.factory.get(oldpath) : new Entry(this.type);
    entry.populate(posted);

    // @todo: add validation
    var newpath = this.factory.save(entry, oldpath);

    if (newpath) {
        this.response.redirect('/entries/' + this.type + '/edit/' + newpath);
    } else {
        this.response.redirect('/entries/' + this.type + '/list');
    }
};


module.exports = Entries;
