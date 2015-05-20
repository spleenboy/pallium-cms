module.exports = function(app) {
    function route(name) {
        return plugin('routes/' + name);
    }

    app.use('/', route('home'));
    app.use('/entry', route('entries'));
};
