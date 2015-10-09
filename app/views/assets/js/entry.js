module.exports = function() {
    var $ = require('jquery');
    var _ = require('underscore');

    // Provide the jquery-validation with access to jQuery
    global.jQuery = $;
    var validate = require('jquery-validation');

    var frequency = 10000;
    var $form = $('form.entry-form');

    if ($form.length) {
        function renewLock() {
            var url = $('#renew-lock').attr('href');
            if (url) {
                $.post(url);
            }
        }
        setInterval(renewLock, frequency);
    }

    $form.validate();
};
