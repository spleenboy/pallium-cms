module.exports = function() {
    var Catdown = require('catdown');
    var editors = document.getElementsByClassName('md-editor');
    for (var i=0; i<editors.length; i++) {
        var editor    = editors[i];
        var previewId = editor.dataset.mdPreview;
        var preview   = document.getElementById(previewId);
        var catdown   = new Catdown({
            textarea: editor,
            preview: preview
        });
    }
};
