var config = plugin('config');
var log    = plugin('services/log')(module);
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
    if (!this.data.domains) {
        return config.resolve(this.data, keys, context);
    }

    if (this.domain in this.data.domains) {
        return config.resolve(this.data.domains[this.domain], keys, context);
    }

    for (var domainName in this.data.domains) {
        return config.resolve(this.data.domains[domainName], keys, context);
    }
};


module.exports = Definition;
