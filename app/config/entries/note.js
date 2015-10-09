var moment = require('moment');

module.exports = {
    type: 'note',
    name: 'Note',
    plural: 'Notes',
    description: 'A note about something',
    directory: 'notes',
    subdirectory: function() {
        var date = moment(this.data('dateAdded'));
        return date.format('YYYY/MM');
    },
    title: function() {
        return this.data('title') || 'New Note';
    },
    fields: [
        {
            type         : 'text',
            name         : 'title',
            label        : 'Title',
            placeholder  : 'Enter title',
            attributes   : {autofocus: true, required: true}
        },
        {
            type         : 'collection',
            name         : 'categories',
            label        : 'Categories',
            fields       : [
                {
                    type         : 'text',
                    name         : 'title',
                    label        : 'Title',
                    placeholder  : 'Enter title',
                    attributes   : {required: true}
                },
                {
                    type         : 'textarea',
                    name         : 'description',
                    label        : 'Description'
                },
                {
                    type : 'collection',
                    name : 'tags',
                    label : 'Tags',
                    fields : [
                        {
                            type: 'text',
                            name: 'tag',
                            label: 'Tag',
                            attributes: {required: true}
                        }
                    ]
                }
            ]
        },
        {
            type         : 'md',
            name         : '__content',
            label        : 'Content',
            full         : true,
        },
        {
            type         : 'date',
            name         : 'dateAdded',
            label        : 'Date Added',
            defaultValue : function() {
                return moment().format('YYYY-MM-DD');
            }
        }
    ]
};
