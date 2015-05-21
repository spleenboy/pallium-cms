var front = require('yaml-front-matter');
var yaml  = require('js-yaml');
var fs    = require('fs');

var delimiter = module.exports.delimiter = '---\n';

module.exports.list = function(dir, recurse) {

}

/**
 *¬Reads a file with front matter and returns the results
**/
module.exports.read = function(file) {
    try {
        return front.loadFront(file);
    } catch (e) {
        console.error("Error loading file", file, e);
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
module.exports.write = function(file, frontMatter, body, callback) {
    var content = this.merge(frontMatter, body);
    fs.writeFile(file, content, function(err) {
        if (err) {
            console.error("Error saving file", file, err);
        }
        if (callback) {
            callback(err, file, frontMatter, body);
        }
    });
};
