var util = require('util');
var control = plugin('controllers/control');

module.exports = util.inherits(Home, control.Controller);


function Home(res, req, next) {}


Home.prototype.list = function() {
    this.response.send('Hello');
};


Home.prototype.login = function() {

};


Home.prototype.logout = function() {

};
