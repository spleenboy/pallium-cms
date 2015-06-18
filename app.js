var express = require('express.io');
var path    = require('path');

// Parse command line arguments
var args = require('minimist')(process.argv.slice(2)) || {};
var port = args.port || process.env.PORT || 4000;

// Initialize the application
var app = express();
require(path.join(__dirname, 'app/bootstrap'))(app, args);

// Start the server
app.listen(port);
console.log('Pallium CMS is running from', process.cwd(), 'at http://localhost:' + port);
