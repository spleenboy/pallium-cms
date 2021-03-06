var fs    = require('fs');
var path  = require('path');
var plugins = require('./plugins');
var log   = plugins.require('services/log')(module);


/**
 * Creates a file-friendly slug version of a string
**/
module.exports.slug = function(value) {
    return value.replace(/([^a-zA-Z0-9]+)/g, '-').toLowerCase();
};


/**
 * Opens a file for writing¬
**/
module.exports.open = function(filepath, force) {
    var flags = force ? 'w' : 'wx';
    try {
        return fs.openSync(filepath, flags);
    }
    catch (e) {
        log.error('Could not open file', filepath, ':', e);
        return false;
    }
}


module.exports.stats = function(filepath) {
    try {
        var stats = fs.statSync(filepath);
        stats.filepath = filepath;
        return stats;
    } catch (e) {
        log.info("File doesn't exist", filepath);
        return false;
    }
};


/**
 * Provides a flat array of the stats (including path)
 * for the files in the specified directory (and subdirectories)
**/
module.exports.list = function(dir, flat) {
    var items = [];
    try {
        var paths = fs.readdirSync(dir);

        log.info("Paths found in", dir, paths);

        for (var i=0; i<paths.length; i++) {

            var filepath = path.join(dir, paths[i]);
            var stats    = this.stats(filepath);

            if (!flat && stats.isDirectory()) {
                items = items.concat(this.list(filepath, flat));
                continue;
            } else if (stats.isFile()) {
                stats.filepath = filepath;
                items.push(stats);
            }
        }
    } catch (e) {
        log.error("Error reading directory", dir, e);
    }
    return items;
};


/**
 * Ensures that all directories in the specified path exist
**/
module.exports.mkdirs = function(filepath) {
    var dirs  = path.dirname(filepath).split(path.sep);
    var dir   = path.sep;
    while (dirs.length) {
        dir = path.join(dir, dirs.shift());
        try {
            var stats = fs.statSync(dir);
        }
        catch (e) {
            log.info("Created directory", dir);
            fs.mkdirSync(dir);
        }
    }
};


module.exports.read = function(filepath) {
    try {
        return fs.readFileSync(filepath);
    } catch (e) {
        log.error("Can't read file", filepath, e);
        return false;
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
        log.error("Error writing file", filepath, e);
        return false;
    }
};


module.exports.delete = function(filepath) {
    try {
        fs.unlinkSync(filepath);
        return true;
    } catch (e) {
        log.error("Error deleting file", filepath, e);
        return false;
    }
};


module.exports.prune = function prune(dirpath) {
    log.debug('Pruning', dirpath);

    var empty = true;
    var list  = fs.readdirSync(dirpath);

    for (var i=list.length - 1; i>=0; i--) {
        var stats = fs.statSync(path.join(dirpath, list[i]));
        if (stats.isFile()) {
            empty = false;
            list.splice(i, 1);
        }
    }

    for (var i=list.length - 1; i>=0; i--) {
        if (this.prune(path.join(dirpath, list[i]))) {
            list.splice(i, 1);
        }
    }

    if (!list.length && empty) {
        fs.rmdirSync(dirpath);
        log.debug('Deleted empty directory', dirpath);
        return true;
    }

    return false;
};


module.exports.rename = function(oldpath, newpath) {
    try {
        this.mkdirs(newpath);
        fs.renameSync(oldpath, newpath);
        return true;
    } catch (e) {
        log.error("Error renaming file", oldpath, "to", newpath, e);
        return false;
    }
};
