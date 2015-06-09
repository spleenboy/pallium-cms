var jade = require('jade');
var path = require('path');


var Views = {};

function View(name, data) {
    this.name      = name;
    this.data      = data || {};
    this.extension = '.jade';
}


View.prototype.template = function() {
    var file = this.name + this.extension;
    return path.join(__dirname, file);
};


View.prototype.compile = function() {
    if (!this.compiled) {
        var template  = this.template();
        this.compiled = jade.compileFile(template);
    }
    return this.compiled;
};


View.prototype.render = function() {
    var compiled = this.compile();
    return compiled(this.data);
};


View.render = function(name, data) {
    if (!(name in Views)) {
        Views[name] = new View(name, data);
    }
    return Views[name].render();
};


module.exports = View;
