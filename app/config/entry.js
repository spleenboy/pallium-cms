var path = require('path');
var plugins = require('../services/plugins');

module.exports = {
    lockTimeout: 30,
    domains: {
        'docs': {
            name: 'Documentation',
            output: function() {
                return path.join(process.cwd(), 'docs')
            },
            types: {
                'page': require('./entries/page'),
                'plugin': require('./entries/plugin'),
                'todo': require('./entries/todo')
            }
        }
    }
}
