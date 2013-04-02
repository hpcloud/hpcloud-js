/*
 * This is a helper script for the header navigation.
 *
 * This script requires jQuery 1.4+
 */

(function($, undefined) {

var handleIn = function() {

  $.data(this, 'waiting-to-open', true);

  $(this).delay(300).queue(function(next) {
    if ($.data(this, 'waiting-to-open')) {
      $(this).addClass("open").removeData('waiting-to-open');
    }
    next();
  });
};

var handleOut = function() {
  $(this).removeClass('open').removeData('waiting-to-open');
};

var handleClick = function() {
  var menuItem = $(this).parent();

  if (!menuItem.hasClass('open')) {
    menuItem.addClass("open");

    return false;
  }
};

var withSubnav = $('.has-subnav');

// Handle the hover events for the header nav.
withSubnav.hover(handleIn, handleOut);

// Handle the click events for the hover nav.
withSubnav.children('a').click(handleClick);

})(jQuery);