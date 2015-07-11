var util   = require('util');
var moment = require('moment');
var plugins = require('../../services/plugins');
var Field  = plugins.require('models/fields/field');
var log    = plugins.require('services/log')(module);

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

    this.on('rendering', function(view) {
        if (view.data.field.value) {
            var fieldDate = moment(view.data.field.value);

            view.data.field.moment = fieldDate;
            view.data.field.date   = fieldDate.format('YYYY-MM-DD');
            view.data.field.time   = fieldDate.format('HH:mm:ss');
            log.debug('view.data.field', view.data.field.date, view.data.field.time);
        }
    });
}

util.inherits(DateTimeField, Field);

module.exports = DateTimeField;
