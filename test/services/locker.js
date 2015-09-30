var assert = require('assert');
var plugins = require('../../app/services/plugins');

describe('locker', function() {
    var session, mockfile, locker;

    before(function() {
        session = {};

        function nope() {
            return false;
        }
        
        mockfile = {
            delete: nope,
            stats: nope,
            open: nope
        };

        plugins.override('services/file', mockfile);
        var Locker = require('../../app/services/locker');
        locker = new Locker(session);
    });

    describe('lock', function() {
        it('should lock in the session', function() {
            mockfile.open = function() {
                return true;
            }
            assert(locker.lock('door', {}));
            assert('door' in session.locked);
        });
    });

    describe('unlock', function() {
    });

    describe('clear', function() {

    });
});
