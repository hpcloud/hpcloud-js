/*
 * This is a helper script for the header search.
 *
 * This script requires jQuery 1.4+
 */

(function($, undefined) {

var toggleSearch = function(e) {
  $(this).toggleClass('highlighted');
  $('#search-region').slideToggle('slow');
  e.preventDefault();
};

$('#search-box-menu-item').parent().click(toggleSearch);
$('#search-region').hide().removeClass('hide');

})(jQuery);