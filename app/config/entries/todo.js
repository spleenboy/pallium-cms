module.exports = {
    type: 'todo',
    name: 'To Do',
    plural: 'To Dos',
    directory: 'todos',
    subdirectory: function() {
        return [
            this.data('major'),
            this.data('minor'),
            this.data('patch')
        ].join('.');
    },
    title: function() {
        return this.data('title');
    },
    subtitle: function() {
        return this.data('milestone');
    },
    fields: [
        {
            type: 'switch',
            name: 'status',
            label: 'Status',
            onState: {
                label: 'Done!'
            },
            offState: {
                label: 'In progress'
            },
        },
        {
            type: 'text',
            name: 'title',
            label: 'Title',
            placeholder: 'What do you need to do?',
            attributes: {required: true, autofocus: true}
        },
        {
            type: 'collection',
            name: 'versions',
            label: 'Versions',
            fields: [
                {
                    type: 'number',
                    name: 'major',
                    label: 'Major Version',
                    attributes: {required: true, min: 0, step: 1},
                    defaultValue: 0
                },
                {
                    type: 'number',
                    name: 'minor',
                    label: 'Minor Version',
                    attributes: {required: true, min: 0, step: 1},
                    defaultValue: 0
                }
            ]
        },
        {
            type: 'md',
            name: '__content',
            label: 'Description'
        }
    ]
};
