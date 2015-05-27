var express = require('express');

// Initializes the application with configuration and routes
module.exports = function(app, args) {
    require('./bootstrap/globals')(app, args);
    require('./bootstrap/plugins')(app, args);

    app.use(express.static('public'));

    plugin('bootstrap/forms')(app);
    plugin('bootstrap/session')(app);
    plugin('bootstrap/auth')(app);
    plugin('bootstrap/routes')(app);
};
