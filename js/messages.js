/*
 * This is a helper script for messages.
 *
 * This script requires jQuery 1.4+
 */

(function($, undefined) {

var closeMessageBox = function(e) {
  $(this).closest('.flash').hide();

  e.preventDefault();
};

$('a.message-close').click(closeMessageBox);

})($);