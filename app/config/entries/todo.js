module.exports = {
    type: 'todo',
    name: 'To Do',
    plural: 'To Dos',
    directory: 'todos',
    subdirectory: function() {
        return this.data('done') ? 'done' : '';
    },
    title: function() {
        return this.data('title');
    },
    subtitle: function() {
        return this.data('done') ? 'Done!' : 'In Progress';
    },
    fields: [
        {
            type         : 'checkbox',
            name         : 'done',
            label        : 'Done!'
        },
        {
            type         : 'text',
            name         : 'title',
            label        : 'Title',
            placeholder  : 'What do you need to do?',
            attributes   : {required: true, autofocus: true}
        },
        {
            type         : 'md',
            name         : '__content',
            label        : 'How will you do it?'
        },
        {
            type         : 'date',
            name         : 'due',
            label        : 'Due Date',
            placeholder  : 'When is it due?'
        }
    ]
};
