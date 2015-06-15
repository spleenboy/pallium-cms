var util        = require('util');
var moment      = require('moment');
var fs          = require('fs');
var path        = require('path');
var mime        = require('mime-types');

var hooks       = plugin('services/hooks');
var file        = plugin('services/file');
var object      = plugin('util/object');
var log         = plugin('services/log')(module);
var Locker      = plugin('services/locker');
var Controller  = plugin('controllers/controller');
var Entry       = plugin('models/entry');
var Definition  = plugin('models/entry-definition');
var Factory     = plugin('models/entry-factory');
var View        = plugin('views/view');


function Entries() {
    object.lazyGet(this, 'type', function() {
        return this.request.params.type;
    });

    // Note: 'domain' is reserved by EventEmitter, so we need to use a different variable here
    object.lazyGet(this, 'entryDomain', function() {
        return this.request.params.domain;
    });

    object.lazyGet(this, 'definition', function() {
        return new Definition(this.entryDomain);
    });

    object.lazyGet(this, 'factory', function() {
        return new Factory(this.type, this.definition);
    });

    Controller.call(this);
}


util.inherits(Entries, Controller);


Entries.prototype.redirect = function() {
    var parts = Array.prototype.slice.call(arguments);

    parts.unshift(this.type);

    if (this.entryDomain) {
        parts.unshift(this.entryDomain);
    }

    parts.unshift('entry');

    var url = '/' + parts.join('/');
    log.info("Redirecting to", url);
    this.response.redirect(url); 
};


Entries.prototype.list = function() {
    var all = this.factory.all();
    var items = [];
    for (var id in all) {
        var item = all[id];
        item.createdMoment  = moment(item.created);
        item.createdFromNow = item.createdMoment.fromNow();
        item.createdIso     = item.createdMoment.format();

        item.modifiedMoment  = moment(item.modified);
        item.modifiedFromNow = item.modifiedMoment.fromNow();
        item.modifiedIso     = item.modifiedMoment.format();
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
        log.error("Can't edit. Invalid entry id", id);
        this.response.redirect('back');
    }

    if (this.request.query.unlock) {
        
    }

    var locker = new Locker(this.request.session); 
    if (entry.filepath && !locker.lock(entry.filepath)) {
        this.request.flash('warn', '"' + entry.getTitle() + '" is locked.');
        this.request.flash('locked', id);
        return this.redirect('list');
    }

    locker.lock(entry.filepath);
    entry.prerender();

    this.send('entries/edit', {entry: entry});
};


Entries.prototype.save = function() {
    var posted = this.request.body[this.type];
    var id     = this.request.params.id;
    var entry  = id ? this.factory.get(id) : new Entry(this.type, this.definition);

    this.factory.populate(entry, posted, this.request.files);

    var id = this.factory.save(entry);

    this.request.flash('info', '"' + entry.getTitle() + '" saved!');

    var locker = new Locker(this.request.session); 
    locker.clear();

    if (id) {
        this.redirect('edit', id);
    } else {
        this.redirect('list');
    }
};


Entries.prototype.delete = function() {
    var id = this.request.params.id;
    var entry = this.factory.delete(id);

    if (entry) {
        this.request.flash('info', '"' + entry.getTitle() + '" was deleted!');
    } else {
        this.request.flash('error', '"' + entry.getTitle() + '" could not be deleted!');
    }

    this.redirect('list');
};


Entries.prototype.file = function() {
    var id = this.request.params.id;
    var fieldName  = this.request.params.field;
    var fileNumber = this.request.params.number || 1;

    var entry = this.factory.get(id);

    if (!entry) {
        this.request.flash('error', 'File not found');
        this.redirect('list');
    }

    var field = entry.fields[fieldName];
    var File  = plugin('models/fields/file');
    if (!(field instanceof File)) {
        this.request.flash('error', 'Field not found');
        this.redirect('list');
    }

    var index     = fileNumber - 1;
    var filenames = Array.isArray(field.value) ? field.value : [field.value];

    if (index < 0 || fileNumber > filenames.length) {
        this.sendError(404);
    }

    var filename = filenames[index];
    var filepath = this.factory.fullpath(filename);

    var stats = file.stats(filepath);

    if (!stats) {
        this.sendError(404);
    }

    this.response.writeHead(200, {
        'Content-Type': mime.contentType(path.basename(filename)),
        'Content-Length': stats.size
    });

    return fs.createReadStream(filepath).pipe(this.response);
};


module.exports = Entries;
