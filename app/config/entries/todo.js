module.exports = {
    type: 'todo',
    name: 'To Do',
    plural: 'To Dos',
    directory: 'todos',
    title: function() {
        return this.data('title');
    },
    fields: [
        {
            type         : 'text',
            name         : 'title',
            label        : 'Title',
            placeholder  : 'What do you need to do?',
            attributes   : {required: true, autofocus: true}
        },
        {
            type         : 'date',
            name         : 'due',
            label        : 'Due Date',
            placeholder  : 'When is it due?'
        },
        {
            type         : 'md',
            name         : '__content',
            label        : 'How will you do it?'
        }
    ]
};
