var path = require('path');

module.exports = {
    title: 'Pallium CMS',
    description: 'Static Site CMS',
    pluginDirectory: function() {
        return path.join(process.cwd(), 'plugins');
    }
};
