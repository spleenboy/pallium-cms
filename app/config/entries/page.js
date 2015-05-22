module.exports = {
    type: 'page',
    name: 'Page',
    plural: 'Pages',
    description: 'A basic page',
    directory: 'pages',
    title: function() {
        return this.data('title') || 'New Page';
    },
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
