var util   = require('util');
var path   = require('path');
var events = require('events');
var _      = require('underscore');

var plugins = require('./plugins');
var log     = plugins.require('services/log')(module);
var hooks   = plugins.require('services/hooks');
var config  = plugins.require('config');
var future  = plugins.require('services/future');
var fs      = plugins.require('services/file');


function Locker(session) {
    this.session = session;
    if (typeof this.session.locked !== 'object') {
        this.session.locked = {};
    }
    events.EventEmitter.call(this);
    hooks.bubble(module, this, ['locked', 'unlocked']);
}

util.inherits(Locker, events.EventEmitter);

Locker.prototype.lock = function(filepath, data) {
    var lock = new Lock(filepath, data);
    var emit = this.emit.bind(this);

    lock.on('expired', function() {
        log.debug('Bubbling up unlocked event for expired lock.', lock);
        emit('unlocked', lock);
    });

    if (filepath in this.session.locked) {
        log.debug('Already locked by user. Renewing expiration', filepath);
        lock.create(true);
        emit('locked', lock);
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
    emit('locked', lock);
    return true;
};

Locker.prototype.unlock = function(filepath, force) {
    if (force || filepath in this.session.locked) {
        var data = this.session.locked[filepath];
        var lock = new Lock(filepath, data);
        var unlocked = lock.destroy();
        delete this.session.locked[filepath];
        this.emit('unlocked', lock);

        if (unlocked) {
            return true;
        }
    }
    return false;
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
    if (!this.timeout || ! this.lockpath) {
        return false;
    }

    log.debug('Setting expiration for', this.lockpath, 'in', this.timeout, 'seconds');
    future.schedule(this.lockpath, this.expired.bind(this), this.timeout * 1000);

    return true;
};


Lock.prototype.expired = function() {
    if (this.destroy()) {
        log.debug('Expired lock on', this.filepath);
    }
    else {
        log.debug('Lock not found for', this.filepath);
    }
    this.emit('expired', this);
};


Lock.prototype.create = function(force) {
    if (!this.lockpath) {
        log.debug('No lockpath found. Could not create lock');
        return false;
    }

    var touched = fs.open(this.lockpath, force);

    if (touched) {
        this.expire();
        log.debug('Created lock', this.lockpath);
        this.emit('created');
        return true;
    }
    else {
        log.error('Could not create lock', this.lockpath);
        var error = new LockError(this, 'create');
        this.emit('created', error);
        return false;
    }
};


Lock.prototype.destroy = function() {
    if (!this.lockpath) {
        return false;
    }

    var deleted = fs.delete(this.lockpath);
    future.cancel(this.lockpath);
    this.emit('destroyed');
    log.debug('Destroyed lock', this.lockpath);
    return deleted;
};


Lock.prototype.stats = function() {
    try {
        return this.lockpath && fs.stats(this.lockpath);
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
