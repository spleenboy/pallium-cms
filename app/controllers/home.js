var util = require('util');
var control = plugin('controllers/control');


function Home() {}


Home.prototype.list = function() {
    this.response.send('Hello');
};


Home.prototype.login = function() {

};


Home.prototype.logout = function() {

};


module.exports = util.inherits(Home, control.Controller);
