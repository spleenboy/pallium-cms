var util   = require('util');
var moment = require('moment');
var plugins = require('../../services/plugins');
var Field  = plugins.require('models/fields/field');

function DateField() {
    Field.apply(this, arguments);

    this.on('setting.value', function(evt) {
        if (evt.value) {
            evt.value = moment(evt.value).toDate();
        }
    });

    this.on('getting.value', function(evt) {
        if (evt.value) {
            evt.value = moment(evt.value).format('YYYY-MM-DD');
        }
    });
}

util.inherits(DateField, Field);

module.exports = DateField;
