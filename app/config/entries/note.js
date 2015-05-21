module.exports = {
    type: 'note',
    name: 'Note',
    plural: 'Notes',
    description: 'A note about something',
    subdirectory: function() {
        var date = new Date();
        return [date.getYear(), date.getMonth()].join('/');
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
            type         : 'datetime',
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
