var front  = require('yaml-front-matter');
var yaml   = require('js-yaml');
var path   = require('path');
var file   = plugin('services/file');
var object = plugin('services/object');
var config = plugin('config');
var Entry  = plugin('models/entry');

var delimiter = module.exports.delimiter = '---\n';

function Factory(type) {
    this.type  = type;
    this.model = new Entry(type);
    this.root  = path.join(
        config.get('entry.output'),
        this.config('directory')
    );
}


Factory.prototype.config = function(key, entry) {
    return config.get(['entry.types', this.type, key].join('.'), entry);
};


Factory.prototype.fullpath = function(relativepath) {
    return path.join(this.root, relativepath);
};


Factory.prototype.all = function() {
    var items = file.list(this.root);
    if (!items) {
        return [];
    }
    var entries = [];
    for (var i=0; i<items.length; i++) {
        var relativepath = items[i].filepath.replace(this.root, '');
        entries.push(relativepath);
    }
    return entries;
};


Factory.prototype.open = function(relativepath) {
    var filepath = this.fullpath(relativepath);
    try {
        var data = front.loadFront(filepath);
        if (!data) {
            console.error("Error parsing file", filepath);
            return false;
        }
        var entry = new Entry(this.type);
        entry.populate(data);
        return entry;
    } catch (e) {
        console.error("Error loading file", filepath, e);
        return false;
    }
};


Factory.prototype.move = function(oldpath, newpath) {

};


/**
 * Joins front matter and a body together into a string.
**/
module.exports.merge = function(frontMatter, body) {
    var front, content = '';

    if (typeof frontMatter === 'object') {
        var front = yaml.safeDump(frontMatter);
        content = delimiter + front + delimiter;
    } else if (frontMatter) {
        throw new Error('Invalid front matter');
    }

    if (typeof body === 'string') {
        content += body;
    } else if (body) {
        throw new Error('Invalid body');
    }

    return content;
}


Factory.prototype.save = function(entry) {
    var filepath = path.join(
        this.root, 
        this.config('subdirectory', entry),
        this.config('filename', entry)
    );
    console.info("Saving entry to path", filepath);
    var data = entry.data();
    var content = data.__content;
    delete(data.__content);

    var frontMatter = yaml.dump(data);

    if (frontMatter) {
        content = delimiter + frontMatter + delimiter + content;
    }

    return file.write(filepath, content);
};


Factory.prototype.delete = function(filepath) {

};


module.exports = Factory;
