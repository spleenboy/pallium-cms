var fs     = require('fs');
var util   = require('util');
var path   = require('path');
var events = require('events');
var moment = require('moment');

var log = plugin('services/log')(module);


function Locker(session) {
    this.session = session;
}

Locker.prototype.lock = function(filepath) {
    this.clear();

    var lock = new Lock(filepath);

    if (lock.exists()) {
        log.debug('Lock already exists');
        return false;
    }

    if (!lock.create()) {
        log.error('Could not create lock');
        return false;
    }

    this.session.locked = filepath;
    return true;
};

Locker.prototype.unlock = function(filepath) {
    if (filepath === this.session.locked) {
        return this.clear();
    }
    var lock = new Lock(filepath);
    return lock.destroy();
};

Locker.prototype.clear = function() {
    if (!this.session.locked) {
        return false;
    }

    var lock = new Lock(this.session.locked);
    lock.destroy();
    delete this.session.locked;

    log.debug('Cleared locker for visitor');
    return true;
};


function Lock(filepath) {
    // The path to the file to lock
    this.filepath = filepath;

    // The duration a lock should last
    this.timeout = {'minutes': 15};

    // Holds a reference to the expiration timer
    this.expiration = null;

    Object.defineProperty(this, 'lockpath', {
        enumerable: true,
        get: function() {
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

    if (!this.timeout) {
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
        log.error('Could not destroy lock', this.lockapth, ':', e);
        var error = new LockError(this, 'destroy', e);
        this.emit('destroyed', error);
        return false;
    }
};


Lock.prototype.stats = function() {
    try {
        return fs.statSync(this.lockpath);
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
