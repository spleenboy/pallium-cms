module.exports = {
    name: 'Page',
    description: 'A basic page',
    fields: [
        {
            type         : 'text',
            name         : 'title',
            label        : 'Title',
            validation   : ['required'],
            defaultValue : 'New Page'
        },
        {
            type         : 'datetime',
            name         : 'publishDate',
            label        : 'Publish Date',
        }
    ]
};
