var util        = require('util');
var moment      = require('moment');
var fs          = require('fs');
var path        = require('path');
var mime        = require('mime-types');
var async       = require('async');
var _           = require('underscore');

var plugins     = require('../services/plugins');
var hooks       = plugins.require('services/hooks');
var file        = plugins.require('services/file');
var object      = plugins.require('util/object');
var log         = plugins.require('services/log')(module);
var Locker      = plugins.require('services/locker');
var Controller  = plugins.require('controllers/controller');
var Entry       = plugins.require('models/entry');
var Definition  = plugins.require('models/entry-definition');
var Factory     = plugins.require('models/entry-factory');
var View        = plugins.require('views/view');


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
            if (!lock.data) {
                log.debug('Lock has no data', lock);
                return;
            }
            log.debug('Broadcasting entry unlocked', lock.data);
            var factory = new Factory(lock.data.type, new Definition(lock.data.domain));
            factory.unlock(lock.data.id);
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


Entries.prototype.items = function() {
    var all = this.factory.all();
    var items = [];
    for (var id in all) {
        var item = _.clone(all[id]);
        item.createdMoment  = moment(item.created);
        item.createdFromNow = item.createdMoment.fromNow();
        item.createdIso     = item.createdMoment.format();

        item.modifiedMoment  = moment(item.modified);
        item.modifiedFromNow = item.modifiedMoment.fromNow();
        item.modifiedIso     = item.modifiedMoment.format();
        items.push(item);
    }

    items = _.sortBy(items, 'title');

    return items;
};


Entries.prototype.viewData = function(entry, items) {

    var data = {};

    data.scripts = [];
    data.baseUrl = '/entry/' + this.entryDomain + '/' + this.type + '/';

    if (entry) {
        entry.prerender();
        data.entry = entry;

        var matched = _.findWhere(items, {id: entry.id});
        if (matched) {
            items = _.filter(items, function(item) {
                return item.id !== entry.id;
            });
            items.unshift(matched);
        }
    }

    data.list = items;

    return data;
};


Entries.prototype.list = function() {
    var items = this.items();

    if (this.factory.model.maximum === 1) {
        var item = items.shift();
        if (item) {
            return this.redirect('edit', item.id);
        } else {
            return this.redirect('create');
        }
    }

    this.send('entries/list', this.viewData(null, items));
};


Entries.prototype.create = function() {
    var entry = this.factory.create();
    var data = this.viewData(entry, this.items());

    this.send('entries/create', data);
};


/**
 * Renews a lock on an entry¬
**/
Entries.prototype.lock = function() {
    var id    = this.request.params.id;
    var entry = this.factory.get(id);

    if (!entry) {
        log.error("Can't lock. Invalid entry id", id);
        return this.notfound();
    }

    var locked = this.locker.lock(entry.filepath, this.broadcastData(entry));
    return this.response.send(locked);
}


Entries.prototype.unlock = function() {
    var id    = this.request.params.id;
    var entry = this.factory.get(id);
    if (!entry) {
        log.error("Can't unlock. Invalid entry id", id);
        this.response.redirect('back');
    }

    async.parallel([
        this.locker.unlock.bind(this.locker, entry.filepath, true)
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
        this.request.flash('locked', ['/entry', this.entryDomain, entry.type, 'unlock', id].join('/'));

        // Special case for single entries to avoid a redirect loop
        if (entry.maximum === 1) {
            return this.response.redirect('/entry/' + this.entryDomain);
        }
        return this.redirect('list');
    }

    var owner = this.request.user && this.request.user.displayName;

    // Have the factory update the index when it can
    async.nextTick(this.factory.lock.bind(this.factory, id, owner || 'someone'));

    var data = this.viewData(entry, this.items());

    this.send('entries/edit', data);
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
        this.app.io.broadcast.bind(this.app.io.broadcast, 'entry ' + action, this.broadcastData(entry))
    ]);

    this.request.flash('info', '"' + entry.getTitle() + '" ' + action + '!');
    this.redirect('edit', id);
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
    var File  = plugins.require('models/fields/file');
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
