// Initializes the application with configuration and routes
module.exports = function(app, args) {
    require('./globals')(app);

    plugin('routes')(app);
};
