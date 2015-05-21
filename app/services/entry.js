var file  = plugin('services/file');
var Entry = plugin('models/entry');


module.exports.open = function(filepath, type) {
    var data = file.read(filepath);
    if (!data) {
        return false;
    }
    var entry = new Entry(type);
    entry.populate(data);
};


module.exports.save = function(entry) {

};


module.exports.delete = function(path) {

};
