var util        = require('util');
var moment      = require('moment');
var fs          = require('fs');
var path        = require('path');
var mime        = require('mime-types');
var async       = require('async');

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

    object.lazyGet(this, 'locker', function() {
        var locker = new Locker(this.request.session);
        var io     = this.app.io;

        locker.on('locked', function(lock) {
            log.debug('Broadcasting entry locked', lock.data);
            io.broadcast('entry locked', lock.data);
        });

        locker.on('unlocked', function(lock) {
            log.debug('Broadcasting entry unlocked', lock.data);
            io.broadcast('entry unlocked', lock.data);
        });
        return locker;
    });

    Controller.call(this);
}


util.inherits(Entries, Controller);


Entries.prototype.broadcastData = function(entry) {
    var data = this.factory.index[entry.id];
    data.domain = entry.definition.domain;
    data.type   = entry.type;
    data.owner  = this.request.user && this.request.user.displayName;

    return data;
};


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


Entries.prototype.landing = function() {
    var data = {};
    this.send('entries/landing', data);
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

    var data = {
        list: items,
        scripts: [
            '//cdnjs.cloudflare.com/ajax/libs/masonry/3.3.0/masonry.pkgd.min.js'
        ]
    };

    this.send('entries/list', data);
};


Entries.prototype.create = function() {
    var entry = this.factory.create();
    entry.prerender();
    this.send('entries/create', {entry: entry});
};


Entries.prototype.unlock = function() {
    var id    = this.request.params.id;
    var entry = this.factory.get(id);
    if (!entry) {
        log.error("Can't unlock. Invalid entry id", id);
        this.response.redirect('back');
    }

    async.parallel([
        this.locker.unlock.bind(this.locker, entry.filepath, true),
        this.factory.unlock.bind(this.factory, id)
    ]);

    this.redirect('edit', id);
};


Entries.prototype.edit = function() {
    var id    = this.request.params.id;
    var entry = this.factory.get(id);
    if (!entry) {
        log.error("Can't edit. Invalid entry id", id);
        this.response.redirect('back');
    }

    if (entry.filepath && !this.locker.lock(entry.filepath, this.broadcastData(entry))) {
        this.request.flash('warn', '"' + entry.getTitle() + '" is locked.');
        this.request.flash('locked', id);

        // Special case for single entries to avoid a redirect loop
        if (entry.maximum === 1) {
            return this.response.redirect('/entry/' + this.entryDomain);
        }
        return this.redirect('list');
    }

    var owner = this.request.user && this.request.user.displayName;

    // Have the factory update the index when it can
    async.nextTick(this.factory.lock.bind(this.factory, id, owner || 'someone'));

    entry.prerender();

    this.send('entries/edit', {entry: entry});
};


Entries.prototype.save = function() {
    var posted = this.request.body[this.type];
    var files  = this.request.files;
    var id     = this.request.params.id;
    var action = id ? 'updated' : 'created';
    var entry  = id ? this.factory.get(id) : new Entry(this.type, this.definition);

    this.factory.populate(entry, posted, files);

    var id = this.factory.save(entry);

    async.parallel([
        this.locker.unlock.bind(this.locker, entry.filepath),
        this.factory.unlock.bind(this.factory, id),
        this.app.io.broadcast.bind(this.app.io.broadcast, 'entry ' + action, this.broadcastData(entry))
    ]);

    this.request.flash('info', '"' + entry.getTitle() + '" ' + action + '!');
    this.redirect('list');
};


Entries.prototype.delete = function() {
    var id = this.request.params.id;
    var entry = this.factory.get(id);

    if (!entry) {
        return this.sendError(404);
    }

    var data  = this.broadcastData(entry);

    var deleted = this.factory.delete(entry);

    if (deleted) {
        async.parallel([
            this.locker.unlock.bind(this.locker, entry.filepath),
            this.app.io.broadcast.bind(this.app.io.broadcast, 'entry deleted', data)
        ]);
        this.request.flash('info', '"' + data.title + '" was deleted!');
    } else {
        this.request.flash('error', '"' + data.title + '" could not be deleted!');
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
        return this.redirect('list');
    }

    var index     = fileNumber - 1;
    var filenames = Array.isArray(field.value) ? field.value : [field.value];

    if (index < 0 || fileNumber > filenames.length) {
        return this.sendError(404);
    }

    var filename = filenames[index];
    var filepath = this.factory.fullpath(filename);

    var stats = file.stats(filepath);

    if (!stats) {
        return this.sendError(404);
    }

    this.response.writeHead(200, {
        'Content-Type': mime.contentType(path.basename(filename)),
        'Content-Length': stats.size
    });

    return fs.createReadStream(filepath).pipe(this.response);
};


module.exports = Entries;
