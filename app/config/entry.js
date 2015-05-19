var path = require('path');

function relativeRequire(name) {
    require(path.join(__dirname, name));
}

module.exports = {
    content: function() {
        return path.join(process.cwd(), 'content')
    },
    types: {
        'page': relativeRequire('entries/page')
    },
}
