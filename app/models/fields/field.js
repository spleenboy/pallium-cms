var object = plugin('util/object');
var log    = plugin('services/log');
var View   = plugin('views/view');

function Field() {
    this.id = null;
    this.entryType = null;
    this.fieldName = null;
}


Field.prototype.render = function(data) {
    if (this.type === undefined) {
        log.trace("Invalid field", util.inspect(this));
        throw new TypeError("Field requires a type");
    }

    data = data || {};
    data.field = this;
    data.field.required = 'required' in this.validators ? 'required' : '';
    return View.render('fields/' + this.type, data);
};

module.exports = Field;
