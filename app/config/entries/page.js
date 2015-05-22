module.exports = {
    type: 'page',
    name: 'Page',
    plural: 'Pages',
    description: 'A basic page',
    directory: 'pages',
    subdirectory: function() {
        return this.data('section').toLowerCase();
    },
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
        },
        {
            type         : 'select',
            name         : 'section',
            label        : 'Section',
            options      : {
                'main': 'Main', 
                'docs': 'Documentation', 
                'hist': 'History'
            },
            defaultValue : 'Main'
        },
        {
            type         : 'md',
            name         : '__content',
            label        : 'Content',
            validation   : ['required']
        }
    ]
};
