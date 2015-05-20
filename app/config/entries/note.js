module.exports = {
    name: 'Note',
    plural: 'Notes',
    description: 'A note about something',
    fields: [
        {
            type         : 'text',
            name         : 'title',
            label        : 'Title',
            validation   : ['required'],
            defaultValue : 'New Note'
        },
        {
            type         : 'tag',
            name         : 'tags',
            label        : 'Tags',
        }
    ]
};
