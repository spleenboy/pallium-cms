var path = require('path');

module.exports = {
    title: 'Pallium CMS',
    output: function() {
        return path.join(process.cwd(), 'output')
    }
};
