var assert = require('assert');

describe('Entry', function() {
    var Entry;
    before(function() {
        global.plugin = function(name) {
            return require('../../app/' + name);
        };
        Entry = require('../../app/models/entry');
    });

    it('should have more unit tests', function() {
        assert(false);
    });

    describe('extension', function() {
        it('should return .md', function() {
            assert.equal('.md', Entry.extension);
        });
    });
});
