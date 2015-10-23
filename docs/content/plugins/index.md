---
title: Plugins
path: /plugins/
filename: index
---
Plugins allow you to extend Pallium's functionality. Plugins are stored in the `./plugins` directory at the root of the application. Each plugin has one entry point, the `index.js` file.
## Example Installation
1. Copy the code into your plugin directory. `git clone https://github.com/spleenboy/pallium-export.git ./plugins/export`
2. Edit your `config/site.js` file to include the name of the installed plugin.

```javascript
module.exports = {
  ...
  plugins: {
    directory: process.cwd() + '/plugins',
    enabled: ['export']
  }
};
```
3. The plugin you installed may have additional requirements, such as a custom configuration file.