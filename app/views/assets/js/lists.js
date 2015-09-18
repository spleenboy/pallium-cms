module.exports = function() {
    var lists = document.getElementsByClassName('fancy-list');

    for (var i=0; i<lists.length; i++) {
        var list = new List(lists[i], {valueNames: lists[i].dataset.listValueNames.split(',')});
    }
};
