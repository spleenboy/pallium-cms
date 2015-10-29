var $ = require('jquery');
require('jquery-ui/sortable');

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
        var nname  = iname.replace('_CLONE_', $items.length);
        $input.attr('name', nname);
    });
    $target.append($clone.slideDown('fast'));
});

$('.field-collection').sortable({
    items: '> .field-collection-item',
    axis: 'y',
    update: function(e, ui) {
        var $list = ui.item.closest('.field-collection');
        var $items = $list.find('.field-collection-item');
        $items.each(function(i, el) {
            var $inputs = $(el).find(':input');
            $inputs.each(function(y, input) {
                var $input = $(input);
                var iname  = $input.attr('name');
                var nname  = iname.replace(/\[(\d+)\](?!\[\d+\])/i, '[' + i + ']');
                $input.attr('name', nname);
            });
        });
    }
});
