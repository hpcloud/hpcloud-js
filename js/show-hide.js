/*
 * This is a helper script for checkboxes.
 *
 * This script requires jQuery 1.4+
 */

(function($, undefined) {

var handleShow = function(e) {
  var id = $(this).text('[Hide]').data('show-hide-id');
  $('#' + id).show();
};

var handleHide = function(e) {
  var id = $(this).text('[Show]').data('show-hide-id');
  $('#' + id).hide();
};

// Initial setup.
var setup = function() {
  var id = $(this).text('[Show]').data('show-hide-id');
  $('#' + id).hide();
};

// Attach handles for actions.
$('.tile-show-hide').toggle(handleShow, handleHide).each(setup);

})(jQuery);