module.exports = {
    type: 'plugin',
    name: 'Plugin',
    plural: 'Plugins',
    description: 'A plugin description',
    directory: '/plugins',
    subdirectory: function() {
        return this.data('title');
    },
    filename: 'index',
    title: function() {
        return this.data('title') || 'New Plugin';
    },
    fields: [
        {
            type: 'text',
            name: 'title',
            label: 'Title',
            attributes: {autofocus: true, required: true},
            defaultValue: 'New Plugin'
        },
        {
            type: 'url',
            name: 'url',
            label: 'URL',
            attributes: {placeholder: "URL for repository or website"}
        },
        {
            type: 'collection',
            name: 'credits',
            label: 'Credit',
            fields: [
                {
                    type: 'text',
                    name: 'name',
                    label: 'Name',
                    attributes: {required: true, placeholder: "Name of person or company"}
                },
                {
                    type: 'url',
                    name: 'url',
                    label: 'URL',
                    attributes: {placeholder: "URL for website"}
                }
            ]
        },
        {
            type: 'md',
            name: '__content',
            label: 'Content',
            full: true
        }
    ]
};
