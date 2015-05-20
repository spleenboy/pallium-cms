var util = require('util');
var config  = plugin('config');
var Controller = plugin('controllers/controller');
var View    = plugin('views/view');


function Home() {}
util.inherits(Home, Controller);


Home.prototype.list = function() {
    var data    = {};
    data.site   = config.get('site');
    data.entry  = config.get('entry');

    var content = View.render('home', data);
    this.response.send(content);
};


Home.prototype.login = function() {

};


Home.prototype.logout = function() {

};


module.exports = Home;
