module.exports = {
    type: 'field',
    name: 'Field',
    plural: 'Fields',
    description: 'Field information',
    directory: '/fields',
    title: function() {
        return this.data('title') || 'New Field';
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
            type: 'md',
            name: '__content',
            label: 'Content',
            full: true
        }
    ]
};
