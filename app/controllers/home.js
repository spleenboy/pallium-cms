var util = require('util');
var control = plugin('controllers/control');
var View = plugin('views/view');


function Home() {}
util.inherits(Home, control.Controller);


Home.prototype.list = function() {
    this.response.send(View.render('home'));
};


Home.prototype.login = function() {

};


Home.prototype.logout = function() {

};


module.exports = Home;
