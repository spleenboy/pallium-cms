# Pallium CMS
> In neuroscience, pallium refers to layers of gray and white matter that cover the upper surface of the brain's cerebrum.

Pallium CMS is a node.js content management application built to create and edit Markdown files with YAML front matter through a simple user interface. Ultimately, the result of this CMS may be used by your static site generator of choice. 


## Why Use Pallium CMS?
Many popular static site generators have been built to consume markdown files with YAML front matter. The problem is that when you're editing your website, these tools assume that you know a lot. You need to know how to write using Markdown, the expected structure of the files, as well as what should go in the front matter for each file. 

Pallium CMS provides you with a front-end for the administration of a static website. This makes it a great choice when you want to allow non-technical people access to edit content for your site.

## Getting Started
- `git clone git@github.com:spleenboy/pallium-cms.git`
- `cd pallium-cms`
- `npm install`
- `npm start`
- `open http://localhost:4000`

## Plugins
### Current
* [Wintersmith](https://github.com/spleenboy/pallium-wintersmith)
* [Grunt](https://github.com/spleenboy/pallium-grunt)

### Planned
* Sculpin
* S3 File integration
* Git integration

## Configuration
The most you may ever need to do to get this tool to work for you is to set up a couple of configuration files. Pallium uses two main files to decide what to present to you in the console, `site.js` and `entries.js`

The default directory for these configuration files is `./config/` but you can put them wherever you'd like. If you use a different location, though, you'll need to start up the node server with a `--config=/path/to/config/directory/` argument so the app knows where to look.

One fun thing about config files is that the values of each key can be static or dynamic. If you'd like to change the value of a setting dynamically, the value can be a function that returns the actual value. More about that later...

### Site.js

This file controls basic things like the site title and plugin locations. Here's the default config file from `./app/config/site.js`

```javascript
var path = require('path');

module.exports = {
    title: 'Pallium CMS',
    description: 'Static Site CMS',
    plugins: {
        // Return the directory where plugins can be found
        directory: function() {
            return path.join(process.cwd(), 'plugins');
        },
        // Include a list of the plugins that should be enabled in this instance
        enabled: []
    }
};
```

### Entry.js

This is where most of your settings will live. This config file is the entry point for defining all of your editable content. In this configuration file, you define "Domains," "Entry Types," and "Fields."

Because so much is set up in the `entry.js` file, it's probably a good idea to break apart the configuration for a complicated site into multiple files. All of the examples below will show you what that would look like.

### Domains
Domains are the top-level organization for the entries.js file. Each domain should have the following keys.

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

### Entry Types
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
            type         : 'md',
            name         : '__content',
            label        : 'Description'
        }    }]
};
```

### Fields
Each entry screen in Pallium will display a form with editable fields. The value for each of these fields, along with the key you specify in your config for the entry, get saved somewhere. Pallium supports a lot of fields out of the box. Each field definition may require different keys, but at a minimum, each field requires the following.

- *type*: This is used to identify the field and determines its behavior.
- *name*: This is the internal name of the field, used as the key when saving an entry.
- *label*: This is a human-friendly version of the name. It usually gets displays on the entry edit page as the label for a form field.
- *attributes*: This is javascript object with keys and values. Anything set here usually gets added to the input field as HTML attributes.

If you're curious how a particular field will be rendered on the edit page, check out the `app/views/fields/` folder. The `type` value will map directly to a template in that directory.

#### Checkbox
#### Checkbox List
#### Color
#### Date
#### Date Time
#### File
#### Hidden
#### Markdown
#### Month
#### Number
#### Range
#### Select
#### Switch
#### Telephone
#### Text
#### Textarea
#### Time
#### URL
#### Week

