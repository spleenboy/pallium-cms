var front = require('yaml-front-matter');
var yaml  = require('js-yaml');
var fs    = require('fs');

var delimiter = module.exports.delimiter = '---\n';


/**
 * Provides a flat array of the stats (including path)
 * for the files in the specified directory (and subdirectories)
**/
module.exports.list = function(dir, recurse) {
    var items = [];
    var paths = fs.readdirSync(dir);
    for (var i=0; i<paths.length; i++) {
        var stats = fs.statSync(paths[i]);
        if (recurse && stats.isDirectory()) {
            items = items.concat(this.list(paths[i], recurse));
            continue;
        } else if (stats.isFile()) {
            stats.path = paths[i];
            items.push(stats);
        }
    }
    return items;
}

/**
 *¬Reads a file with front matter and returns the results
**/
module.exports.read = function(filepath) {
    try {
        return front.loadFront(filepath);
    } catch (e) {
        console.error("Error loading file", filepath, e);
        return false;
    }
};


/**
 *¬Joins front matter and a body together into a string.
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


/**
 *¬Writes out front matter and content to a file.
**/
module.exports.write = function(filepath, frontMatter, body, callback) {
    var content = this.merge(frontMatter, body);
    fs.writeFile(filepath, content, function(err) {
        if (err) {
            console.error("Error saving file", filepath, err);
        }
        if (callback) {
            callback(err, filepath, frontMatter, body);
        }
    });
};
