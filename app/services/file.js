var fs    = require('fs');
var path  = require('path');


/**
 * Provides a flat array of the stats (including path)
 * for the files in the specified directory (and subdirectories)
**/
module.exports.list = function(dir, flat) {
    var items = [];
    try {
        var paths = fs.readdirSync(dir);
        for (var i=0; i<paths.length; i++) {
            var stats = fs.statSync(paths[i]);
            if (!flat && stats.isDirectory()) {
                items = items.concat(this.list(paths[i], flat));
                continue;
            } else if (stats.isFile()) {
                stats.filepath = paths[i];
                items.push(stats);
            }
        }
    } catch (e) {
        console.error("Error reading directory", dir, e);
    }
    return items;
};


/**
 * Ensures that all directories in the specified path exist
**/
module.exports.mkdirs = function(filepath) {
    var dirs  = path.dirname(filepath).split(path.sep);
    var dir   = '';
    while (dirs.length) {
        dir = path.join(dir, dirs.shift());
        try {
            var stats = fs.statSync(dir);
        }
        catch (e) {
            console.info("Created directory", dir);
            fs.mkdirSync(dir);
        }
    }
};


/**
 * Writes out a file asynchronously
**/
module.exports.write = function(filepath, content) {
    try {
        this.mkdirs(filepath);
        fs.writeFileSync(filepath, content);
        return filepath;
    } catch (e) {
        console.error("Error writing file", filepath, e);
        return false;
    }
};


module.exports.delete = function(filepath) {
    try {
        fs.unlinkSync(filepath);
        return true;
    } catch (e) {
        console.error("Error deleting file", filepath, e);
        return false;
    }
};
