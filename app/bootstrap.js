// Initializes the application with configuration and routes
module.exports = function(app, args) {
    require('./globals')(app, args);
    require('./plugins')(app, args);

    plugin('routes')(app);
};
