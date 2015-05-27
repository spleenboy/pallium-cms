module.exports = function() {
    var Catdown = require('catdown');
    var editors = document.getElementsByClassName('md-editor');
    for (var i=0; i<editors.length; i++) {
        var editor    = editors[i];
        var previewId = editor.dataset.mdPreview;
        if (previewId) {
            var preview   = document.getElementById(previewId);
            var catdown   = new Catdown({
                textarea: editor,
                preview: preview
            });
        } else {
            var catdown = new Catdown({textarea: editor});
        }
    }

    var toggles = document.querySelectorAll('.md-wrapper .button-toggle');
    for (var i=0; i<toggles.length; i++) {
        toggles[i].addEventListener('click', function() {
            var parent  = this.parentNode;
            var wrapper = parent.parentNode;
            var swaps   = wrapper.children;

            for (var y=0; y<swaps.length; y++) {
                var swap = swaps[y];
                if (swap === parent) {
                    swap.classList.add('hidden');
                } else {
                    swap.classList.remove('hidden');
                }
            }

            return false;
        });
    }
};
