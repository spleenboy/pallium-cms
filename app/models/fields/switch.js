var util  = require('util');
var plugins = require('../../services/plugins');
var Checkbox = plugins.require('models/fields/field');

function Switch() {
    Checkbox.apply(this, arguments);
}

util.inherits(Switch, Checkbox);


Switch.prototype.validateDefinition = function() {
    this.super_validateDefinition();

    assert.equals(typeof this.onState, 'object');
    assert.equals(typeof this.offState, 'object');
    assert(this.onState.label !== undefined);
    assert(this.offState.label !== undefined);
};

module.exports = Switch;
