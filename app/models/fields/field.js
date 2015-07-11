var assert = require('assert');
var events = require('events');
var util   = require('util');

var plugins = require('../../services/plugins');
var object = plugins.require('util/object');
var log    = plugins.require('services/log')(module);
var View   = plugins.require('views/view');

function Field() {
    this.id = null;
    this.entryType = null;
    this.fieldName = null;
    events.EventEmitter.call(this);
}


util.inherits(Field, events.EventEmitter);


Field.prototype.validateDefinition = function() {
    function stringOrFunction(value) {
        return ['string', 'function'].indexOf(typeof value) >= 0;
    }

    assert(
        typeof this.name === 'string', 
        "Definition 'name' must be a string"
    );

    assert( 
        stringOrFunction(this.label),
        "Definition 'label' must be a string or function"
    );

    assert(
        this.attributes === undefined || typeof this.attributes === 'object',
        "Definition 'attributes' must be a key-value object"
    );

    assert(
        this.placeholder === undefined || stringOrFunction(this.placeholder),
        "Definition 'placeholder' must be a string or function"
    );

    return true;
};


Field.prototype.render = function(data) {
    if (this.type === undefined) {
        throw new TypeError("Field requires a type");
    }

    var template = 'fields/' + this.type;

    data = data || {};
    data.field = this;

    var view = new View(template, data);

    this.emit('rendering', view);

    var rendering = view.render();

    this.emit('rendered', rendering);

    return rendering;
};

module.exports = Field;
