var config = plugin('config');
var object = plugin('util/object');

function Definition(domain) {
    this.data = config.get('entry') || {};
    this.domain = domain;

    var domainProperties = ['name', 'output', 'types'];

    domainProperties.forEach(function(prop) {
        Object.defineProperty(this, prop, {
            enumerable: true,
            get: this.get.bind(this, prop)
        });
    }, this);

    Object.defineProperty(this, 'domains', {
        enumerable: true,
        get: function() {
            return this.data.domains;
        }
    });
}


Definition.prototype.get = function(keys, context) {
    var domain = this.data;
    if (this.data.domains) {
        if (this.domain in this.data.domains) {
            domain = this.data.domains[domain];
        } else {
            for (var key in this.data.domains) {
                domain = this.data.domains[key];
                break;
            }
        }
    }
    var value = config.resolve(domain, keys, context); 
    return value;
};


module.exports = Definition;
