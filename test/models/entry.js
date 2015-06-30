var assert = require('assert');

describe('Entry', function() {
    var Entry, EntryDefinition;
    before(function() {
        global.plugin = function(name) {
            return require('../../app/' + name);
        };
        Entry = require('../../app/models/entry');
        EntryDefinition = require('../../app/models/entry-definition');
    });

    describe('configure', function() {
        it('should fail on an invalid definition', function() {
            assert.throws(function() {
                var entry = new Entry('fake', null);
            }, /Invalid definition/);

            assert.throws(function() {
                var entry = new Entry('fake', {types: []});
            }, /No configuration/);
        });

        it('should set type and definition when created', function() {
            var def = new EntryDefinition('test', {
                types: {
                    'monkey': {
                        'fields': []
                    }
                }
            });
            var entry = new Entry('monkey', def);
            assert.equal(entry.type, 'monkey');
            assert.equal(entry.definition, def);
        });
    });

    describe('get', function() {
        it('should be tested', function() {
            assert(false);
        });
    });

    describe('loadFields', function() {
        it('should be tested', function() {
            assert(false);
        });
    });

    describe('getRelativePath', function() {
        it('should be tested', function() {
            assert(false);
        });
    });

    describe('getExtension', function() {
        it('should be tested', function() {
            assert(false);
        });
    });

    describe('getFilename', function() {
        it('should be tested', function() {
            assert(false);
        });
    });

    describe('getTitle', function() {
        it('should be tested', function() {
            assert(false);
        });
    });

    describe('getSubtitle', function() {
        it('should be tested', function() {
            assert(false);
        });
    });

    describe('data', function() {
        it('should be tested', function() {
            assert(false);
        });
    });

    describe('prerender', function() {
        it('should be tested', function() {
            assert(false);
        });
    });
});
