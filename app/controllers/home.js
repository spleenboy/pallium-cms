var util = require('util');
var plugins    = require('../services/plugins');
var config     = plugins.require('config');
var Controller = plugins.require('controllers/controller');


function Home() {
    Controller.call(this);
}

util.inherits(Home, Controller);


Home.prototype.list = function() {
	this.send('home');
};

module.exports = Home;
