var plugin = require('../../services/plugins').require;

module.exports = {
    checkbox     : plugin('models/fields/checkbox'),
    checkboxlist : plugin('models/fields/checkboxlist'),
    collection   : plugin('models/fields/collection'),
    date         : plugin('models/fields/date'),
    datetime     : plugin('models/fields/datetime'),
    field        : plugin('models/fields/field'),
    file         : plugin('models/fields/file'),
    hidden       : plugin('models/fields/hidden'),
    select       : plugin('models/fields/select'),
};
