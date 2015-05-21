var util   = require('util');
var object = plugin('services/object');
var View   = plugin('views/view');

function Field() {}


Field.prototype.render = function() {
    if (this.type === undefined) {
        console.trace("Invalid field", util.inspect(this));
        throw new TypeError("Field requires a type");
    }
    if (this.value === undefined) {
        this.value = this.defaultValue;
    }
    return View.render('fields/' + this.type, this);
};


/**
 *¬Factory method for creating a new Field instance
 * based on the settings specified
**/
Field.create = function(settings) {

    var field;
    var props = object.assign({
        type         : 'text',
        source       : null,
        name         : null,
        value        : null,
        label        : null,
        validators   : [],
        defaultValue : null,
    }, settings);

    if (settings.source) {
        field = require(settings.source);
    } else {
        field = new Field();
    }

    object.defineProperties(field, props);

    return field;
};

module.exports = Field;
