var path = require('path');

module.exports = {
    output: function() {
        return path.join(process.cwd(), 'content')
    },
    types: {
        'home': plugin('config/entries/home'),
        'page': plugin('config/entries/page'),
        'note': plugin('config/entries/note'),
        'event': plugin('config/entries/event')
    },
    sets: {
        'main': {
            name  : 'Main',
            types : ['home', 'page', 'event']
        },
        'internal': {
            name  : 'Main',
            types : ['note']
        }
    }
}
