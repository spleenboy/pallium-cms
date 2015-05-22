var front  = require('yaml-front-matter');
var yaml   = require('js-yaml');
var path   = require('path');
var file   = plugin('services/file');
var object = plugin('services/object');
var random = plugin('services/random');
var config = plugin('config');
var Entry  = plugin('models/entry');

var delimiter = module.exports.delimiter = '---\n';

function Factory(type) {
    this.type  = type;
    this.model = new Entry(type);

    this.output    = config.get('entry.output');
    this.directory = this.config('directory');
    this.root      = path.join(this.output, this.directory);
    this.indexPath = path.join(this.root, 'index.yaml');

    this.loadIndex();
}


Factory.prototype.config = function(key, entry) {
    var key = ['entry.types', this.type, key].join('.');
    return config.get(key, entry);
};


Factory.prototype.fullpath = function(relativepath) {
    return path.join(this.root, relativepath);
};


Factory.prototype.relativepath = function(fullpath) {
    return path.relative(this.root, fullpath);
};


Factory.prototype.loadIndex = function() {
    var contents = file.read(this.indexPath);
    this.index = contents ? yaml.safeLoad(contents) || {} : {};
};


Factory.prototype.saveIndex = function() {
    var contents = yaml.safeDump(this.index);
    return file.write(this.indexPath, contents);
};


Factory.prototype.all = function() {
    var entries = [];
    for (var id in this.index) {
        var entry = this.index[id];
        entries.push({
            id       : id,
            filepath : entry.filepath,
            title    : entry.title
        });
    }
    return entries;
};


Factory.prototype.get = function(id) {
    var item = this.index[id];
    if (!item) {
        return false;
    }

    var filepath = this.fullpath(item.filepath);

    try {
        var data = front.loadFront(filepath);
        if (!data) {
            console.error("Error parsing file", filepath);
            return false;
        }
        var entry = new Entry(this.type);
        entry.id = id;

        entry.populate(data);
        return entry;
    } catch (e) {
        console.error("Error loading file", filepath, e);
        return false;
    }
};


Factory.prototype.save = function(entry) {
    var data = entry.data();
    var content = data.__content;
    delete(data.__content);

    var frontMatter = yaml.dump(data);

    if (frontMatter) {
        content = delimiter + frontMatter + delimiter + content;
    }

    var filepath = path.join(
        this.root, 
        entry.getFilename()
    );

    if (entry.id && entry.id in this.index) {
        var oldEntry = this.index[entry.id];
        var oldPath  = this.fullpath(oldEntry.filepath);
        if (oldPath !== filepath) {
            console.info("Deleting old entry path", oldPath);
            file.delete(oldPath);
        }
    }

    var id = entry.id || random.id();

    console.info("Saving entry to path", filepath);

    if (file.write(filepath, content)) {
        this.index[id] = {
            title    : entry.getTitle(),
            filepath : this.relativepath(filepath)
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

    var filepath = this.fullpath(item.filepath);
    if (file.delete(filepath)) {
        delete this.index[id];
        return this.saveIndex();
    }

    return false;
};


module.exports = Factory;
