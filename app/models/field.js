var util   = require('util');
var object = plugin('util/object');
var View   = plugin('views/view');

function Field() {
    this.id = null;
    this.entryType = null;
    this.fieldName = null;
}


Field.prototype.render = function() {
    if (this.type === undefined) {
        console.trace("Invalid field", util.inspect(this));
        throw new TypeError("Field requires a type");
    }
    this.required = 'required' in this.validators ? 'required' : '';
    return View.render('fields/' + this.type, {field: this});
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
        field = new plugin(settings.source)();
    } else {
        field = new Field();
    }

    object.defineProperties(field, props);

    return field;
};

module.exports = Field;
