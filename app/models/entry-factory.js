var front  = require('yaml-front-matter');
var yaml   = require('js-yaml');
var path   = require('path');

var object = plugin('util/object');
var random = plugin('util/random');
var log    = plugin('services/log')(module);
var file   = plugin('services/file');

var Entry      = plugin('models/entry');
var Definition = plugin('models/entry-definition');

var indexFile = '_index.yaml';

function Factory(type, definition) {

    if (!(definition instanceof Definition)) {
        throw new TypeError('Invalid definition');
    }

    if (!(type in definition.types)) {
        throw new TypeError('Invalid type');
    }

    this.delimiter = '---\n';
    this.type = type;
    this.definition = definition;
    this.output = this.definition.get('output');

    if (!this.output) {
        throw new TypeError('Definition must include output directory');
    }

    this.model     = new Entry(type, definition);
    this.directory = this.model.get('directory') || '';
    this.root      = path.join(this.output, this.directory || '');
    this.indexPath = path.join(this.root, indexFile);

    this.loadIndex();
}


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

    var contents = file.read(this.indexPath);

    if (contents) {
        try {
            this.index = yaml.safeLoad(contents);
        } catch (e) {
            log.error("Error reading contents of index", this.indexPath, e);
            this.index = {};
        }
    } else {
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
        var id = random.id();
        var item = {
            id       : id,
            title    : stats.filepath,
            filepath : stats.filepath,
            modified : stats.mtime,
            created  : stats.birthtime
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
        var contents = yaml.safeDump(this.index);
        return file.write(this.indexPath, contents);
    } catch (e) {
        log.error("Error saving index to", this.indexPath, e, this.index);
        throw e;
    }
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
    return entry;
};


Factory.prototype.get = function(id) {
    var item = this.index[id];

    if (!item) {
        return false;
    }

    var filepath = this.fullpath(item.filepath);

    try {

        var entry = new Entry(this.type, this.definition);
        entry.id = id;
        entry.created  = item.created;
        entry.modified = item.modified;

        if (item.created || item.modified) {
            var data = front.loadFront(filepath);

            if (!data) {
                log.error("Error parsing file", filepath);
                return false;
            }

            this.populate(entry, data);
        } else {
            log.warn("Entry file not found. Skipping population", item);
        }

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
    for (var key in entry.fields) {
        var field = entry.fields[key];

        if (files && field.fieldName in files) {
            // A file was added for the field
            this.uploadFieldFile(field, files[field.fieldName]);
        } else if (field.name in data) {
            if (field.multipart && data[field.name].deleted) {
                this.deleteFieldFiles(field, data[field.name].deleted);
            } else {
                // Data was included
                field.value = data[field.name];
            }
        } else if (!field.multipart) {
            // Multipart fields don't support default values
            var defaultValue = field.defaultValue;
            if (typeof defaultValue === 'function') {
                field.value = defaultValue.call(this);
            } else {
                field.value = defaultValue;
            }
        }
    }
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


Factory.prototype.uploadFieldFile = function(field, upload) {
    if (field.value && !field.multiple) {
        var oldpath = this.fullpath(field.value);
        log.debug("Removing old file for field", oldpath);
        file.delete(oldpath);
    }

    var filename = upload.originalname;
    if (typeof field.rename === 'function') {
        filename = field.rename.call(field, upload);
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
    var data = entry.data();
    var content = data.__content;
    delete(data.__content);

    if (data !== undefined) {
        try {
            var frontMatter = yaml.safeDump(data);

            if (frontMatter) {
                content = this.delimiter + frontMatter + this.delimiter + content;
            }
        } catch (e) {
            log.error("Error dumping front matter for entry", entry.type, data);
            throw e;
        }
    }

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

    var id = entry.id || random.id();

    log.info("Saving entry to path", filepath);

    if (file.write(filepath, content)) {
        this.index[id] = {
            id       : id,
            title    : entry.getTitle(),
            subtitle : entry.getSubtitle(),
            filepath : this.relativepath(filepath),
            created  : entry.created || new Date(),
            modified : new Date()
        };
        this.saveIndex();
        return id;
    }

    return false;
};


Factory.prototype.delete = function(id) {
    var item = this.index[id];
    if (!item) {
        return false;
    }

    var entry = this.get(id);

    if (!entry) {
        log.error('Entry not found for id', id);
        throw new Error('Could not find entry');
    }

    // Delete all of the files
    for (var key in entry.fields) {
        var field = entry.fields[key];
        if (field.multipart && field.value) {
            file.delete(field.value);
        }
    }

    // Delete the actual record
    var filepath = this.fullpath(item.filepath);
    if (file.delete(filepath)) {
        delete this.index[id];
        if (this.saveIndex()) {
            return entry;
        } else {
            return false;
        }
    }

    return false;
};


module.exports = Factory;
