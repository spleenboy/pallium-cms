module.exports = function() {
    if (!io) {
        console.warn('socket.io is not loaded');
        return;
    }
    var $ = require('jQuery');

    io = io.connect();

    function flash(message) {
        console.info(message);
        var flasher = $('#flasher');
        var item = $('<div class="flash" data-type="flash"></div>').html(message);
        flasher.append(item);
    }

    function flashEntryAction(data, action) {
        if (data.owner) {
            flash(data.owner + ' ' + action + ' "' + data.title + '"');
        }
        else {
            flash('"' + data.title + '" has been ' + action);
        }

    }

    io.on('flash', function(message) {
        flash(message);
    });

    io.on('entry updated', function(data) {
        flashEntryAction(data, 'updated');
    });

    io.on('entry deleted', function(data) {
        flashEntryAction(data, 'deleted');
        $('#entry-' + data.id).remove();
    });

    io.on('entry created', function(data) {
        flashEntryAction(data, 'created');
        var item = $('<li class="item entry-new" id="entry-' + data.id + '"><strong class="title">' + data.title + '</strong></li>');
        $('.entry-list').prepend(item);
    });

    io.on('entry locked', function(data) {
        var item = $('#entry-' + data.id);
        item.addClass('button-unlock');
        item.removeClass('button-edit');
    });

    io.on('entry unlocked', function(data) {
        var item = $('#entry-' + data.id);
        item.removeClass('button-unlock');
        item.addClass('button-edit');
    });
};
