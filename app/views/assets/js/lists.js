module.exports = function() {
    var $ = require('jQuery');
    var _ = require('underscore');

    function like(query, text) {
        query = query.toLowerCase();
        text = text.toLowerCase();
        return text.indexOf(query) >= 0;
    }

    function search(e) {
        var query = e.currentTarget.value;
        var items = this.find('.item');
        items.each(function(i, item) {
            var $item = $(item);
            var searchables = $item.find('.searchable')
            var match = _.some(searchables, function(s) {
                var text = $(s).text();
                return like(query, text);
            });
            if (!match) {
                $item.hide();
            } else {
                $item.show();
            }
        });
    }

    function sort(e) {
        var select = $(e.currentTarget);
        var cmd = select.val().split(' ');
        var key = cmd[0];
        var dir = cmd[1];

        var $items = this.find('.item').detach();

        $items = _.sortBy($items, function(item) {
            return $(item).find(key).text();
        });

        if (dir === 'desc') {
            $items = $items.reverse();
        }

        this.find('.list').append($items);
    }

    $('.fancy-list').each(function(i, list) {
        var $list = $(list);
        $list.on('keyup', '.search', $.proxy(search, $list));
        $list.on('change', '.sort', $.proxy(sort, $list));
    });
};
