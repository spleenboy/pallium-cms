// Handles wrapping together the site and plugin scripts into one bundle
var events = require('events');
var util = require('util');
var browserify = require('browserify');
var path = require('path');
var fs = require('fs');
var glob = require('glob');

var plugins = require('../services/plugins');
var log = plugins.require('services/log');
var hooks  = plugins.require('services/hooks');

var viewScripts = path.join(process.cwd(), '/app/views/assets/js/**/*.js');
var destination = path.join(process.cwd(), '/public/assets/js/bundle.js');

function Bundler(app) {
    events.EventEmitter.call(this);
    hooks.bubble(module, this, ['bundling']);
    this.bundle(app);
}

util.inherits(Bundler, events.EventEmitter);

Bundler.prototype.bundle = function(app) {
    var event = {
        'scripts': []
    };

    this.emit('bundling', event);

    glob(viewScripts, function(err, files) {
        if (err) {
            log.error("Error getting scripts", err);
            throw err;
        }

        files = files.concat(event.scripts);

        var output = fs.createWriteStream(destination);
        browserify()
            .add(files)
            .bundle()
            .pipe(output);
    });
};

module.exports = function(app) {
    return new Bundler(app);
};
