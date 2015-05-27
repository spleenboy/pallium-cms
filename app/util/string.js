module.exports.repeat = function repeat(str, count) {
    return Array(count).join(str);
};

module.exports.padLeft = function padLeft(str, padding, length) {
    return (repeat(padding) + str).slice(0 - length);
};


module.exports.padRight = function padRight(str, padding, length) {
    return (str + repeat(padding)).slice(0 - length);
};
