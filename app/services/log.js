var winston = require('winston');


module.exports = function(caller) {
    function label() {
        return caller.filename.replace(process.cwd(), '');
    }

    return new winston.Logger({
        transports: [
            new winston.transports.Console({colorize: true, label: label()})
        ]
    });
};
