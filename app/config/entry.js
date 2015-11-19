var path = require('path');
var plugins = require('../services/plugins');

module.exports = {
    locker: {
        enabled: true,
        timeout: 30
    },
    domains: {
        'docs': {
            name: 'Documentation',
            output: function() {
                return path.join(process.cwd(), 'docs/content/')
            },
            types: {
                'page': require('./entries/page'),
                'field': require('./entries/field'),
                'plugin': require('./entries/plugin')
            }
        }
    }
}
