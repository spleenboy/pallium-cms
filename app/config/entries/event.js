module.exports = {
    type: 'event',
    name: 'Event',
    plural: 'Events',
    description: 'Something is Happening!',
    directory: 'events',
    subdirectory: function() {
        var date = new Date(this.data('startDate')) || new Date();
        return date.getYear() + '/' + date.getMonth();
    },
    title: function() {
        return this.data('title') || 'New Event';
    },
    fields: [
        {
            type         : 'text',
            name         : 'title',
            label        : 'Title',
            attributes   : {autofocus: true, required: true},
            defaultValue : 'New Event'
        },
        {
            type         : 'text',
            name         : 'subtitle',
            label        : 'Subtitle'
        },
        {
            type         : 'text',
            name         : 'location',
            label        : 'Location'
        },
        {
            type         : 'datetime',
            name         : 'startDate',
            label        : 'Start Date'
            attributes   : {required: true},
        },
        {
            type         : 'datetime',
            name         : 'endDate',
            label        : 'End Date'
        },
        {
            type         : 'md',
            name         : '__content',
            label        : 'Content'
        }
    ]
};
