var assert = require('assert');

describe('EntryFactory', function() {
    var Factory, Definition, mockfile, mockIo;

    before(function() {
        function nope() {
            return false;
        }

        function emptyA() {
            return [];
        }
        
        mockfile = {
            read: emptyA,
            list: emptyA,
            write: nope 
        };
        mockIo = {
            import: nope,
            export: nope
        };
        var plugins = require('../../app/services/plugins');
        plugins.override('services/file', mockfile);
        plugins.override('services/io', mockIo);
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

        it('should use an existing index', function() {
            mockfile.read = function(fp) {
                return false;
            };

            mockfile.write = function(path, content) {
                return true;
            };

            mockIo.import = function(indexPath) {
                var now = new Date();
                return {
                    'f1': {id: 'f1', filepath: 'foo', title: 'foo'},
                    'f2': {id: 'f2', filepath: 'foo', title: 'foo'},
                    'f3': {id: 'f3', filepath: 'foo', title: 'foo'},
                    'f4': {id: 'f4', filepath: 'foo', title: 'foo'},
                };
            };

            factory.loadIndex();

            assert.equal(Object.keys(factory.index).length, 4);
            for (var id in factory.index) {
                assert.equal(factory.index[id].id, id);
                assert.equal(factory.index[id].filepath, 'foo');
                assert.equal(factory.index[id].title, 'foo');
            }
        });

        it('should ignore all but .md, .json, and .yaml when creating a new index ', function() {
            mockIo.import = function(indexPath) {
                return false;
            };

            mockfile.write = function(filepath, content) {
                return true;
            };

            mockfile.list = function(filepath) {
                return [{
                    'filepath' : 'foo.md',
                    'mtime' : 'now',
                    'birthtime' : 'then'
                },
                {
                    'filepath' : 'foo.json',
                    'mtime' : 'now',
                    'birthtime' : 'then'
                },
                {
                    'filepath' : 'foo.yaml',
                    'mtime' : 'now',
                    'birthtime' : 'then'
                },
                {
                    'filepath' : 'foo.bar',
                    'mtime' : 'now',
                    'birthtime' : 'then'
                }];
            };

            factory.loadIndex();

            assert.equal(Object.keys(factory.index).length, 3);
            for (var id in factory.index) {
                assert.equal(factory.index[id].modified, 'now');
                assert.equal(factory.index[id].created, 'then');
            }
        });
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
