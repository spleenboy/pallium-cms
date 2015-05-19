var express = require('express');
var path    = require('path');

// Parse command line arguments
var args = require('minimist')(process.argv.slice(2)) || {};
var port = args.port || 4000;

// Initialize the application
var app = express();

app.use(express.static('public'));
require(path.join(__dirname, 'app/bootstrap'))(app, args);

// Start the server
app.listen(port);
console.log('Pallium CMS is running at http://localhost:' + port);
