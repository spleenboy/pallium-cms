var winston = require('winston');
var plugins = require('./plugins');
var config  = plugins.require('config');


module.exports = function(caller) {
    function label() {
        return caller.filename.replace(process.cwd(), '');
    }

    return new winston.Logger({
        transports: [
            new winston.transports.Console({
                colorize: true, 
                label: label(),
                level: config.get('site.logLevel')
            })
        ]
    });
};
