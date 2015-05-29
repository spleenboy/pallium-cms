var util = require('util');
var config  = plugin('config');
var Controller = plugin('controllers/controller');


function Home() {}
util.inherits(Home, Controller);


Home.prototype.list = function() {
	this.send('home');
};


module.exports = Home;
