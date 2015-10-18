module.exports = {
    type: 'page',
    name: 'Page',
    plural: 'Pages',
    description: 'A page',
    directory: '/',
    subdirectory: function() {
        return this.data('path');
    },
    filename: function() {
        return this.data('filename') || 'index';
    },
    title: function() {
        return this.data('title') || 'New Page';
    },
    subtitle: function() {
        return this.data('path') + this.data('filename');
    },
    fields: [
        {
            type: 'text',
            name: 'title',
            label: 'Title',
            attributes: {autofocus: true, required: true},
            defaultValue: 'New Page'
        },
        {
            type: 'text',
            name: 'path',
            label: 'Path',
            attributes: {required: true, placeholder: "/path/to/file/"},
            defaultValue: '/'
        },
        {
            type: 'text',
            name: 'filename',
            label: 'Filename',
            attributes: {required: true},
            defaultValue: 'index'
        },
        {
            type: 'md',
            name: '__content',
            label: 'Content',
            full: true
        }
    ]
};
