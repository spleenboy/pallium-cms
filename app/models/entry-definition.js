var plugins = require('../services/plugins');
var config  = plugins.require('config');
var log     = plugins.require('services/log')(module);
var object  = plugins.require('util/object');

function Definition(domain, data) {
    this.domain = domain;
    this.data   = data || config.get('entry') || {};

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
        return config.resolve(this.data, keys, context || this);
    }

    var domains = Object.keys(this.data.domains);

    if (this.domain in this.data.domains) {
        return config.resolve(this.data.domains[this.domain], keys, context || this);
    }

    for (var domainName in this.data.domains) {
        return config.resolve(this.data.domains[domainName], keys, context || this);
    }
};


module.exports = Definition;
