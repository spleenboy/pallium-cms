// Initializes the application with configuration and routes
module.exports = function(app, args) {
    require(__dirname + '/globals')(app);

    var config = appRequire('config');
    console.info('site.title', config.get('site.title'));
    console.info('site.output', config.get('site.output'));


    appRequire('routes')(app);
};
