module.exports = {
    type: 'home',
    maximum: 1,
    name: 'Home Page',
    plural: 'Home Page',
    title: 'home',
    fields: [
        {
            type         : 'text',
            name         : 'heading',
            label        : 'Heading',
            validation   : ['required'],
            defaultValue : 'Welcome'
        },
        {
            type         : 'md',
            name         : 'sidebar',
            label        : 'Sidebar'
        },
        {
            type         : 'md',
            name         : '__content',
            label        : 'Content'
        }
    ]
};
