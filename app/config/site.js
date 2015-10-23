var path = require('path');

module.exports = {
    title: 'Pallium CMS',
    description: 'Static Site CMS',
    logLevel: 'debug',
    plugins: {
        // Return the directory where plugins can be found
        directory: path.join(process.cwd(), 'plugins'),
        // Include a list of the plugins that should be enabled in this instance
        enabled: []
    }
};
