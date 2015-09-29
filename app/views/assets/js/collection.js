var $ = require('jQuery');

$('body').on('click', '[data-delete]', function(e) {
    e.preventDefault();
    var $el = $(e.currentTarget);
    var $target = $el.closest($el.data('delete'));
    $target.slideUp(function() {
        $target.remove();
    });
});

$('body').on('click', '[data-clone]', function(e) {
    e.preventDefault();
    var $el     = $(e.currentTarget);
    var $clone  = $($el.data('clone')).clone();
    var $target = $($el.data('target'));
    var $items  = $target.find($el.data('item'));

    // Prepare the clone for placement
    $clone.removeClass('hidden').hide();
    $clone.attr('id', $clone.attr('id') + '-' + $items.length);
    $clone.find(':input').each(function(i, input) {
        // Hacky! Find the last zero-index in the input name and
        // replace it with the next highest available index based
        // on the number of existing items.

        var $input = $(input);
        var iname  = $input.attr('name');
        var pos    = iname.lastIndexOf('0');
        $input.attr('name', iname.substr(0, pos) + $items.length + iname.substr(pos+1));
    });
    $target.append($clone.slideDown('fast'));
});
