---
title: Configuration
path: /configuration/
filename: index
---
The most you may ever need to do to get this tool to work for you is to set up a couple of configuration files. Pallium uses two main files to decide what to present to you in the console, `site.js` and `entry.js`

The default directory for these configuration files is `./config/` but you can put them wherever you'd like. If you use a different location, though, you'll need to start up the node server with a `--config=/path/to/config/directory/` argument so the app knows where to look.

One fun thing about config files is that the values of each key can be static or dynamic. If you'd like to change the value of a setting dynamically, the value can be a function that returns the actual value. More about that later.