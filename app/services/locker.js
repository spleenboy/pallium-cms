var fs     = require('fs');
var util   = require('util');
var path   = require('path');
var events = require('events');
var moment = require('moment');
var _      = require('underscore');

var plugins = require('./plugins');
var log    = plugins.require('services/log')(module);
var config = plugins.require('config');


function Locker(session) {
    this.session = session;
    this.max = 1; 
    if (typeof this.session.locked !== 'object') {
        this.session.locked = {};
    }
    events.EventEmitter.call(this);
}

util.inherits(Locker, events.EventEmitter);

Locker.prototype.lock = function(filepath, data) {
    this.limit();
    var lock = new Lock(filepath, data);

    if (filepath in this.session.locked) {
        log.debug('Already locked by user', filepath);
        this.emit('locked', lock);
        return true;
    }

    if (lock.exists()) {
        log.debug('Lock already exists');
        return false;
    }

    if (!lock.create()) {
        log.error('Could not create lock');
        return false;
    }

    this.session.locked[filepath] = lock.data;
    this.emit('locked', lock);
    return true;
};

Locker.prototype.unlock = function(filepath, force) {
    if (force || filepath in this.session.locked) {
        var data = this.session.locked[filepath];
        var lock = new Lock(filepath, data);
        var unlocked = lock.destroy();
        delete this.session.locked[filepath];
        if (unlocked) {
            this.emit('unlocked', lock);
            return true;
        }
    }
    return false;
};

Locker.prototype.limit = function() {
    var paths = Object.keys(this.session.locked);
    if (!paths || paths.length < this.max) {
        return;
    }

    var sorted = _.sortBy(this.session.locked, function(lock) {
        return lock.created;
    });

    log.debug(sorted.length + " is too many locks! Applying limit.");

    while (this.max < sorted.length) {
        var lock = sorted.pop();
        this.unlock(lock.filepath, true);
    }
};

Locker.prototype.clear = function() {
    for (var filepath in this.session.locked) {
        this.unlock(filepath);
    }
    this.emit('cleared', this.session.locked);
    log.debug('Cleared locker for visitor');
    return true;
};


function Lock(filepath, data) {
    // The path to the file to lock
    this.filepath = filepath;

    // Extra data about the file
    this.data = data;

    // The duration a lock should last
    this.timeout = config.get('entry.lockTimeout');

    // Holds a reference to the expiration timer
    this.expiration = null;

    // When it was made
    this.created = new Date();

    Object.defineProperty(this, 'lockpath', {
        enumerable: true,
        get: function() {
            if (!this.filepath) {
                log.error('A lock requires a filepath');
                return false;
            }
            var dir  = path.dirname(this.filepath);
            var base = path.basename(this.filepath);
            return path.join(dir, '.' + base + '.lock');
        }
    });

    events.EventEmitter.call(this);
}

util.inherits(Lock, events.EventEmitter);


Lock.prototype.expire = function() {

    if (this.expiration) {
        clearTimeout(this.expiration);
    }

    if (!this.timeout || ! this.lockpath) {
        return false;
    }

    var future  = moment().add(this.timeout);
    var delay   = future.diff(moment(), 'seconds') * 1000;
    var expired = this.expired.bind(this);

    log.debug('Setting expiration for', this.lockpath, 'to', future.format());
    this.expiration = setTimeout(expired, delay);
};


Lock.prototype.expired = function() {
    if (this.destroy()) {
        log.debug('Expired lock on', this.filepath);
        this.emit('expired');
    }
    else {
        log.debug('Lock not found for', this.filepath);
    }
};


Lock.prototype.create = function(force) {
    if (!this.lockpath) {
        return false;
    }

    var flags = force ? 'w' : 'wx';
    try {
        fs.openSync(this.lockpath, flags);
        this.expire();
        log.debug('Created lock', this.lockpath);
        this.emit('created');
        return true;
    }
    catch (e) {
        log.error('Could not create lock', this.lockpath, ':', e);
        var error = new LockError(this, 'create', e);
        this.emit('created', error);
        return false;
    }
};


Lock.prototype.destroy = function() {
    if (!this.lockpath) {
        return false;
    }

    try {
        fs.unlinkSync(this.lockpath);
        if (this.expiration) {
            clearTimeout(this.expiration);
        }
        this.emit('destroyed');
        log.debug('Destroyed lock', this.lockpath);
        return true;
    }
    catch (e) {
        log.error('Could not destroy lock', this.lockpath, ':', e);
        var error = new LockError(this, 'destroy', e);
        this.emit('destroyed', error);
        return false;
    }
};


Lock.prototype.stats = function() {
    try {
        return this.lockpath && fs.statSync(this.lockpath);
    }
    catch (e) {
        return false;
    }
};


Lock.prototype.exists = function() {
    if (this.stats()) {
        return true;
    }
    return false;
};


function LockError(lock, method, error) {
    this.lock   = lock;
    this.method = method;
    this.error  = error;
    Error.call(this);
}


util.inherits(LockError, Error);


Locker.Lock = Lock;
Locker.LockError = LockError;
module.exports = Locker;
