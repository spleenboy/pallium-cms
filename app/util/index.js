var plugin = require('../services/plugins').require;
module.exports = {
    string: plugin('util/string'),
    object: plugin('util/object'),
    random: plugin('util/random')
};
