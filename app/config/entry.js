var path = require('path');

module.exports = {
    lockTimeout: {'minutes': 5},
    domains: {
        'website': {
            name: 'Website',
            output: function() {
                return path.join(process.cwd(), 'content')
            },
            types: {
                'home': plugin('config/entries/home'),
                'page': plugin('config/entries/page'),
                'event': plugin('config/entries/event')
            }
        },
        'notes': {
            name: 'Planning',
            output: function() {
                return path.join(process.cwd(), 'content/planning')
            },
            types: {
                'note': plugin('config/entries/note'),
                'todo': plugin('config/entries/todo')
            }
        }
    }
}
