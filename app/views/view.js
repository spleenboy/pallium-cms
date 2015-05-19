var jade = require('jade');
var path = require('path');

function View(name) {
    this.name      = name;
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


View.prototype.render = function(data) {
    var compiled = this.compile();
    return compiled(data);
};


View.render = function(name, data) {
    var view = new View(name);
    return view.render(data);
};


module.exports = View;
