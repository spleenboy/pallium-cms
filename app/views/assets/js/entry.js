module.exports = function() {
    var frequency = 5000;
    var $ = require('jQuery');
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
};
