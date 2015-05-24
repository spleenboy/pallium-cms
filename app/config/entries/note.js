module.exports = {
    type: 'note',
    name: 'Note',
    plural: 'Notes',
    description: 'A note about something',
    directory: 'notes',
    subdirectory: function() {
        var date = new Date(this.data('dateAdded')) || new Date();
        return [date.getYear(), date.getMonth()].join('/');
    },
    title: function() {
        return this.data('title') || 'New Note';
    },
    fields: [
        {
            type         : 'text',
            name         : 'title',
            label        : 'Title',
            validation   : ['required'],
            defaultValue : 'New Note'
        },
        {
            type         : 'date',
            name         : 'dateAdded',
            label        : 'Date Added',
            defaultValue : function() {return new Date();}
        },
        {
            type         : 'md',
            name         : '__content',
            label        : 'Content',
            validation   : ['required']
        }
    ]
};
