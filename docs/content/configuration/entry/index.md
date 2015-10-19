---
title: config/entry.js
path: /configuration/entry/
filename: index
---

### config/entry.js

This is where most of your settings will live. This config file is the entry point for defining all of your editable content. In this configuration file, you define "Domains," "Entry Types," and "Fields."

Because so much is set up in the `entry.js` file, it's probably a good idea to break apart the configuration for a complicated site into multiple files. All of the examples below will show you what that would look like.

#### Domains
Domains are the top-level organization for the entry.js file. Each domain should have the following keys.

 - *name*: The string is the name displays in the Pallium interface
 - *output*: This string is the full path to the top-level directory where all content within the domain will be managed.
 - *types*: This object is a set of key-value pairs. The key is an abbreviation for entry type and gets used to generate urls. The value is a javascript object with the definition for the entry type.

`entry.js`

```javascript
module.exports = {
    domains: {
        'website' : require('./website/index.js'),
        'instructions' : require('./instructions/index.js')
    }
};
```

`website/index.js`
```javascript
var path = require('path');

module.exports = {
    'name': 'My Website',
    'output': function() {
        return path.join(__dirname, '../contents');
    },
    types: {
        'pages': require('./pages'),
        'events': require('./events'),
        'resources': require('./resources'),
        'news': require('./news')
    }
};
```

#### Entry Types
An individual "Entry" maps to a file (usually a .md, .yaml or .json file) somewhere. How you configure the entry determines where the file will be saved and what it will be called.

- *type*: This should match the key (abbreviation) used to identify the entry type.
- *name*: The human-friendly name for the entry type.
- *plural*: A pluralization of the _name_.
- *maximum*: A number. Right now, the only supported value is `1`, which means there can be only one of this entry type. In this case, when you click to edit, you are immediately taken to the edit page for the single entry instead of a list page.
- *directory*: (optional) This string or function should return the relative name of the directory where all files will be saved for this entry type. The full location for an entry file is determined by combining the `output` value for the domain with the `directory`, `subdirectory` and calculated `filename` values for the entry type.
- *subdirectory*: (optional) This string or function can return a subdirectory where an entry will be saved.
- *filename*: (optional) The name of the file to save.
- *extension*: (optional) The extension to give files. This also determines the file format. Currently supported extensions are *.md*, *.json* and *.yaml*.
- *title*: Usually a function that returns a string, this value determines what displays on the list page for an entry type. It can also be used to guess the `filename` if one hasn't been specified.
- *subtitle*: (optional) An optional subtitle that will be displayed on the entry type list page.
- *fields*: This is an array of the field objects that define the available fields for an entry.

`./website/pages.js`

```javascript
module.exports = {
    type: 'pages',
    name: 'Page',
    plural: 'Pages',
    directory: 'pages',
    subdirectory: function() {
        return this.data('slug');
    },
    filename: 'index',
    title: function() {
        return this.data('title');
    },
    subtitle: function() {
        return this.data('subtitle');
    },
    fields: [{
        {
            type: 'text',
            name: 'title',
            label: 'Title',
            attributes: {autofocus: true, required: true}
        },
        {
            type: 'text',
            name: 'subtitle',
            label: 'Subtitle'
        },
        {
            type: 'text',
            name: 'slug',
            label: 'Slug',
            attributes: {required: true}
        },
        {
            type: 'hidden',
            name: 'template',
            label: 'Template',
            value: 'index.jade'
        },
        {
            type: 'md',
            name: '__content',
            label: 'Description'
        }
    }]
};
```