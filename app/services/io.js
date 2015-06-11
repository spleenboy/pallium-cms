var path  = require('path');
var front = require('yaml-front-matter');
var yaml  = require('js-yaml');
var file  = plugin('services/file');
var log   = plugin('services/log')(module);

var exporters = {};

exporters['.json'] = function(data) {
    return JSON.stringify(data, true);
};


exporters['.md'] = function(data) {
    var content = data.__content || '';
    delete(data.__content);

    if (data !== undefined) {
        try {
            var frontMatter = yaml.safeDump(data);

            if (frontMatter) {
                content = '---\n' + frontMatter + '---\n' + content;
            }
        } catch (e) {
            log.error("Error dumping front matter for data", data);
            throw e;
        }
    }

    return content;
};


exporters['.yaml'] = function(data) {
    return yaml.safeDump(data);
};


var importers = {};

importers['.json'] = function(filepath) {
    var json = file.read(filepath);
    return JSON.parse(json);
};


importers['.md'] = function(filepath) {
    return front.loadFront(filepath);
};


importers['.yaml'] = function(filepath) {
    var content = file.read(filepath);
    if (content === false) {
        return false;
    }
    return yaml.safeLoad(content);
};


module.exports.import = function(filepath) {
    var ext = path.extname(filepath);
    if (ext in importers) {
        return importers[ext](filepath);
    }
    throw new Error('Unsupported file type');
};

module.exports.export = function(data, filepath) {
    var ext = path.extname(filepath);
    if (ext in exporters) {
        return exporters[ext](data);
    }
    throw new Error('Unsupported file type');
};
