var util   = require('util');
var assert = require('assert');
var Parent = plugin('models/fields/select');

function Checkboxlist() {
    Parent.call(this);

    this.on('getting.options', function(event) {
        if (typeof event.value === 'function') {
            event.value = event.value.call(this);
        }
    });
}

util.inherits(Checkboxlist, Parent);

module.exports = Checkboxlist;
