var assert = require('assert');

describe('EntryFactory', function() {
    var Factory, Definition, mockfile;

    before(function() {
        mockfile = {
            read: function() {return [];}
        };
        global.plugin = function(name) {
            if (name === 'services/file') {
                return mockfile;
            }
            return require('../../app/' + name);
        };
        Factory = require('../../app/models/entry-factory');
        Definition = require('../../app/models/entry-definition');
    });


    describe('constructor', function() {
        it('should require a valid definition', function() {
            function make() {
                return new Factory('foo', {});
            }
            assert.throws(make, /Invalid definition/);
        });

        it('should require an output directory in the definition', function() {
            function make() {
                var def = new Definition(null, {
                    types: {foo: {}}
                });
                return new Factory('foo', def);
            }
            assert.throws(make, /Definition must include output directory/);
        });

        it('should require a valid type', function() {
            function make() {
                var def = new Definition(null, {
                    output: 'there',
                    types: {foo: {}}
                });
                return new Factory('bar', def);
            }
            assert.throws(make, /Invalid type/);
        });
    });


    describe('fullpath', function() {
        it ('should join the root and relative path', function() {
            var def = new Definition(null, {
                output: 'there',
                types: {foo: {fields: []}}
            });
            var factory = new Factory('foo', def);
            assert.equal(factory.fullpath('be/dragons'), 'there/be/dragons');
        });
    });


    describe('relativepath', function() {
        it ('should remove the root from the fullpath', function() {
            var def = new Definition(null, {
                output: 'there',
                types: {foo: {fields: []}}
            });
            var factory = new Factory('foo', def);
            assert.equal(factory.relativepath('there/be/dragons'), 'be/dragons');
        });
    });


    describe('loadIndex', function() {
        var factory;
        beforeEach(function() {
            var def = new Definition(null, {
                output: 'there',
                types: {foo: {fields: []}}
            });
            factory = new Factory('foo', def);
        });

        it('should create a single index when the model maximum is 1', function() {
            factory.model.maximum = 1;
            factory.model.getRelativePath = function() {
                return 'bar';
            };
            factory.model.getTitle = function() {
                return 'baz';
            };
            mockfile.stats = function(fp) {
                return {
                    mtime: 'now',
                    birthtime: 'yesterday'
                };
            };
            mockfile.slug = function(t) {
                return 'mockid';
            };

            factory.loadIndex();

            assert.deepEqual(factory.index['mockid'], {
                id: 'mockid',
                title: 'baz',
                filepath: 'bar',
                modified: 'now',
                created: 'yesterday' 
            });
        });

        it('should create and save a new index if needed', function() {
            mockfile.read = function(fp) {
                return false;
            };

            mockfile.list = function(dir) {
                var now = new Date();
                return [
                    {filepath: 'foo', mtime: now, birthtime: now},
                    {filepath: 'foo', mtime: now, birthtime: now},
                    {filepath: 'foo', mtime: now, birthtime: now},
                    {filepath: 'foo', mtime: now, birthtime: now},
                ];
            };

            mockfile.write = function(path, content) {
                return true;
            };

            factory.loadIndex();

            assert.equal(Object.keys(factory.index).length, 4);
            for (var id in factory.index) {
                assert.equal(factory.index[id].id, id);
                assert.equal(factory.index[id].filepath, 'foo');
                assert.equal(factory.index[id].title, 'foo');
            }
        });

        it('should use existing index if found', function() {
            mockfile.read = function(fp) {
                return "ID0:\n"
+ "  id: ID0\n"
+ "  title: Foo\n"
+ "  subtitle: Bar\n"
+ "  filepath: foo.md\n"
+ "  created: 2015-01-01T00:00:00.000Z\n"
+ "  modified: 2015-01-01T00:00:00.001Z\n"
+ "ID1:\n"
+ "  id: ID1\n"
+ "  title: Baz\n"
+ "  subtitle: Quz\n"
+ "  filepath: baz.md\n"
+ "  created: 2014-01-01T00:00:00.000Z\n"
+ "  modified: 2014-01-01T00:00:00.001Z";
            };

            mockfile.write = function(path, content) {
                return true;
            };

            factory.loadIndex();

            assert.equal(Object.keys(factory.index).length, 2);
            assert.equal(factory.index.ID0.id, 'ID0');
            assert.equal(factory.index.ID1.id, 'ID1');
        });
    });


    describe('createIndex', function() {

    });


    describe('saveIndex', function() {

    });


    describe('all', function() {

    });


    describe('create', function() {

    });


    describe('get', function() {

    });


    describe('save', function() {

    });


    describe('delete', function() {

    });
});
