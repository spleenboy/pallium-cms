var rand = {};

rand.between = function(low, high) {
    return Math.floor((Math.random() * high) + low);
};

rand.character = function() {
    var chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    var index = rand.between(0, chars.length - 1);
    return chars[index];
};

rand.id = function(len) {
    len = len || 16;
    var s = '';
    for (var i=0; i<len; i++) {
        s += rand.character();
    }
    return s;
};

module.exports = rand;
