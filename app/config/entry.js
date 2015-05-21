var path = require('path');

module.exports = {
    output: function() {
        return path.join(process.cwd(), 'output')
    },
    types: {
        'page': plugin('config/entries/page'),
        'note': plugin('config/entries/note')
    },
}
