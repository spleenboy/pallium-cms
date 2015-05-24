var path = require('path');

module.exports = {
    title: 'Pallium CMS',
    description: 'Static Site CMS',
    domain: 'http://localhost:4000',
    pluginDirectory: function() {
        return path.join(process.cwd(), 'plugins');
    }
};
