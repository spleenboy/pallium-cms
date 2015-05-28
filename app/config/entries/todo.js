module.exports = {
    type: 'todo',
    name: 'To Do',
    plural: 'To Dos',
    directory: 'todos',
    title: function() {
        return this.data('title');
    },
    subtitle: function() {
        if (this.data('done')) {
          return 'Done!';
        }
        return '';
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
