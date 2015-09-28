var util   = require('util');
var events = require('events');
var path   = require('path');

var plugins = require('../services/plugins');
var object  = plugins.require('util/object');
var random  = plugins.require('util/random');
var log     = plugins.require('services/log')(module);
var file    = plugins.require('services/file');
var io      = plugins.require('services/io');

var Entry      = plugins.require('models/entry');
var Definition = plugins.require('models/entry-definition');


function Factory(type, definition) {

    if (!(definition instanceof Definition)) {
        throw new TypeError('Invalid definition');
    }

    if (!(type in definition.types)) {
        var types = Object.keys(definition.types);
        console.error('Type not found in definition', type, types, definition);
        throw new TypeError('Invalid type');
    }

    this.type = type;
    this.definition = definition;
    this.output = this.definition.get('output');

    if (!this.output) {
        throw new TypeError('Definition must include output directory');
    }

    this.model     = new Entry(type, definition);
    this.directory = this.model.get('directory') || '';
    this.root      = path.join(this.output, this.directory || '');
    this.indexPath = path.join(this.root, '.' + type + '.index.yaml');

    this.loadIndex();

    events.EventEmitter.call(this);
}


util.inherits(Factory, events.EventEmitter);


Factory.prototype.fullpath = function(relativepath) {
    return path.join(this.root, relativepath);
};


Factory.prototype.relativepath = function(fullpath) {
    return path.relative(this.root, fullpath);
};


Factory.prototype.loadIndex = function() {

    if (this.model.maximum === 1) {
        this.createSingleIndex();
        return;
    }

    if (this.directory === undefined) {
        log.warn("Missing directory for entry type that allows multiple entries. This can cause problems!", this.type);
    }

    this.index = io.import(this.indexPath);

    if (this.index === false) {
        this.createIndex();
    }
};


// Creates a pseudo-index for one entry, if it exists
Factory.prototype.createSingleIndex = function() {

    var filepath = this.model.getRelativePath();
    var stats    = file.stats(this.fullpath(filepath));
    var title    = this.model.getTitle();
    this.id      = file.slug(title);

    this.index = {};

    this.index[this.id] = {
        id       : this.id,
        title    : title,
        filepath : filepath,
        modified : stats && stats.mtime,
        created  : stats && stats.birthtime
    };
};


// Scans the directory for files and creates entries for them
Factory.prototype.createIndex = function() {
    var items  = file.list(this.root);
    this.index = {};
    for (var i=0; i<items.length; i++) {
        var stats = items[i];
        var relpath = this.relativepath(stats.filepath);

        if (['.md', '.json', '.yaml'].indexOf(path.extname(relpath)) < 0) {
            continue;
        }

        var id = random.id();
        var item = {
            id       : id,
            title    : relpath,
            subtitle : '',
            filepath : relpath,
            modified : stats.mtime || null,
            created  : stats.birthtime || null
        };
        this.index[id] = item;
    }
    this.saveIndex();
};


Factory.prototype.saveIndex = function() {
    if (this.model.maximum === 1) {
        return false;
    }
    if (this.index === undefined) {
        throw new Error('Undefined index');
    }
    try {
        var contents = io.export(this.index, this.indexPath);
        return file.write(this.indexPath, contents);
    } catch (e) {
        log.error("Error saving index", this.index, "to", this.indexPath, ":", e);
        throw e;
    }
};


Factory.prototype.lock = function(id, data) {
    if (!this.index[id]) {
        log.error('Entry id not found in index', id);
        return false;
    }
    this.index[id].locked = data;
    return this.saveIndex();
};


Factory.prototype.unlock = function(id) {
    if (!this.index[id]) {
        log.error('Entry id not found in index', id);
        return false;
    }
    this.index[id].locked = false;
    return this.saveIndex();
};


Factory.prototype.all = function() {
    return this.index;
};


Factory.prototype.create = function() {
    var entry = new Entry(this.type, this.definition);
    entry.id       = null;
    entry.created  = new Date();
    entry.modified = new Date();
    this.populate(entry, {});
    this.emit('creating', entry);
    return entry;
};


Factory.prototype.get = function(id) {
    var item = this.index[id];

    var event = {
        'id'    : id,
        'item'  : item,
        'entry' : null
    };

    // Allow listeners to intercept the get request and return
    // something.
    this.emit('getting', event);

    if (event.entry) {
        this.emit('got', event.entry);
        return event.entry;
    }

    if (!item) {
        return false;
    }

    var filepath = this.fullpath(item.filepath);

    try {

        var entry = new Entry(this.type, this.definition);
        entry.id = id;
        entry.filepath = filepath;
        entry.created  = item.created;
        entry.modified = item.modified;

        var stats = file.stats(filepath);

        if (item.created || item.modified) {
            var data = io.import(filepath);

            if (!data) {
                log.error("Error parsing file", filepath);
                return false;
            }

            this.populate(entry, data);
        } else {
            log.warn("Entry file not found. Skipping population", item);
        }

        this.emit('got', entry);

        return entry;

    } catch (e) {
        log.error("Error loading file", filepath, e);
        return false;
    }
};


/**
 * Populates the values in the fields from a data dictionary
 * Optionally manages multipart fields by uploading a new file
 * and associating it to the field.
**/
Factory.prototype.populate = function(entry, data, files) {
    var event = {
        'entry' : entry,
        'data'  : data,
        'files' : files
    };

    this.emit('populating', event);

    for (var key in entry.fields) {
        var field = entry.fields[key];

        if (files && field.fieldName in files) {
            // A file was added for the field
            this.uploadFieldFile(entry, field, files[field.fieldName]);
        } else if (data && field.name in data) {
            if (field.multipart && data[field.name] && data[field.name].deleted) {
                this.deleteFieldFiles(field, data[field.name].deleted);
            } else {
                // Data was included
                field.value = data[field.name];
            }
        } else if (!field.multipart) {
            // Multipart fields don't support default values
            var defaultValue = field.defaultValue;
            if (typeof defaultValue === 'function') {
                field.value = defaultValue.call(entry);
            } else {
                field.value = defaultValue;
            }
        }
    }

    this.emit('populated', event);
};


Factory.prototype.deleteFieldFiles = function(field, files) {
    if (!files) {
        return;
    }

    if (!files.forEach) {
        files = [files];
    }

    var existing = field.value;
    if (!existing.forEach) {
        existing = [existing];
    }

    files.forEach(function(oldname) {
        var index = existing.indexOf(oldname);
        if (index >=0 ) {
            var oldpath = this.fullpath(oldname);
            file.delete(oldpath);
            existing.splice(index, 1);
        }
    }, this);

    if (field.multiple) {
        field.value = existing;
    } else if (existing.length) {
        field.value = existing.shift();
    } else {
        field.value = '';
    }
};


Factory.prototype.uploadFieldFile = function(entry, field, upload) {
    if (field.value && !field.multiple) {
        var oldpath = this.fullpath(field.value);
        log.debug("Removing old file for field", oldpath);
        file.delete(oldpath);
    }

    var filename = upload.originalname;
    if (typeof field.rename === 'function') {
        filename = field.rename.call(entry, upload);
    }

    var newpath = this.fullpath(filename);

    if (file.rename(upload.path, newpath)) {
        if (!field.multiple) {
            field.value = filename;
        } else if (field.value) {
            field.value.push(filename);
        } else {
            field.value = [filename];
        }
    } else {
        file.delete(upload.path);
    }
};


Factory.prototype.save = function(entry) {
    var content = io.export(entry.data(), entry.getFilename());

    var filepath = path.join(
        this.root, 
        entry.getRelativePath()
    );

    if (entry.id && entry.id in this.index) {
        var oldEntry = this.index[entry.id];
        var oldPath  = this.fullpath(oldEntry.filepath);
        if (oldPath !== filepath) {
            log.info("Deleting old entry path", oldPath);
            file.delete(oldPath);
        }
    }

    entry.id = entry.id || random.id();
    entry.filepath = filepath;
    var index = {
        id       : entry.id,
        title    : entry.getTitle(),
        subtitle : entry.getSubtitle(),
        filepath : this.relativepath(filepath),
        created  : entry.created || new Date(),
        modified : new Date()
    };

    var event = {
        'filepath': filepath,
        'entry'   : entry,
        'index'   : index,
        'content' : content
    };

    this.emit('saving', event);

    log.info("Saving entry to path", event.filepath);

    if (file.write(event.filepath, event.content)) {
        this.index[entry.id] = event.index;
        this.saveIndex();
        this.emit('saved', event);
        return entry.id;
    }

    return false;
};


Factory.prototype.delete = function(entry) {
    this.emit('deleting', entry);

    // Delete all of the files
    for (var key in entry.fields) {
        var field = entry.fields[key];
        if (field.multipart && field.value) {
            file.delete(field.value);
        }
    }

    delete this.index[entry.id];
    var deleted = file.delete(entry.filepath) && this.saveIndex();

    if (deleted) {
        this.emit('deleted', entry);
    }

    // Asynchronously prune the root directory
    var root = this.root;
    process.nextTick(function() {
        file.prune(root);
    });

    return deleted;
};


module.exports = Factory;
