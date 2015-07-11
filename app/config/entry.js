var path = require('path');
var plugins = require('../services/plugins');

module.exports = {
    lockTimeout: {'minutes': 5},
    domains: {
        'website': {
            name: 'Website',
            output: function() {
                return path.join(process.cwd(), 'content')
            },
            types: {
                'home': plugins.require('config/entries/home'),
                'page': plugins.require('config/entries/page'),
                'event': plugins.require('config/entries/event')
            }
        },
        'notes': {
            name: 'Planning',
            output: function() {
                return path.join(process.cwd(), 'content/planning')
            },
            types: {
                'note': plugins.require('config/entries/note'),
                'todo': plugins.require('config/entries/todo')
            }
        }
    }
}
