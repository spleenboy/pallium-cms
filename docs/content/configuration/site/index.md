---
title: config/site.js
path: /configuration/site/
filename: index
---
### config/site.js

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