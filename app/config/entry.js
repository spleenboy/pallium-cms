var path = require('path');

module.exports = {
    output: function() {
        return path.join(process.cwd(), 'content')
    },
    types: {
        'page': plugin('config/entries/page'),
        'note': plugin('config/entries/note'),
        'event': plugin('config/entries/event')
    },
}
