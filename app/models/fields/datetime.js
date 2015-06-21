var util   = require('util');
var moment = require('moment');
var Field  = plugin('models/fields/field');

function DateTimeField() {
    Field.apply(this, arguments);

    this.on('setting.value', function(evt) {
        if (evt.value instanceof Date) {
            evt.value = moment(evt.value).toDate();
        }
        else if (evt.value && evt.value.date && evt.value.time) {
            evt.value = moment(evt.value.date + ' ' + evt.value.time).toDate();
        }
    });

    this.on('getting.value', function(evt) {
        if (evt.value) {
            evt.value = moment(evt.value).format();
        }
    });
}

util.inherits(DateTimeField, Field);

module.exports = DateTimeField;
