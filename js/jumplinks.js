(function ($, window, undefined) {
  $(window).load(function() {
    // Our phantom spans that we are using for the jumplinks' targets'
    // substitutes need to adjust their 'margin-top' and 'height' values
    // to be that of the #header-container height added to the #toolbar
    // height if applicable.
    // We could hard-code this to 124px, but one day this may need to work
    // in a responsive design.

    if ($('#header-container').length != 0) {
      header_height = $('#header-container').height();
    }
    else {
      header_height = 0;
    }

    if ($('#toolbar').length != 0) {
      toolbar_height = $('#toolbar').height();
    }
    else {
      toolbar_height = 0;
    }
    span_height = header_height + toolbar_height;
    // Select all of the anchor tags that begin with a '#'
    $('a[href^="\#"]').each(function(key, val) {
      // We only want to mess with the jumplinks.  Anchor tags with only a '#'
      // for their href aren't jump links but links with some kind of JS
      // click handler attached to them.
      if ($(this).attr('href').length > 1) {
        //alert($(this).attr('href'));
        original_id = $(this).attr('href').substring(1, $(this).attr('href').length);
        
        // Let's first hope we see jumplinks done the xhtml-compliant way (i.e.,
        // they use the "id" attribute instead of the "name" attribute)
        if ($('#' + original_id).length != 0) {
          target = $('#' + original_id);
        }
        else if ($('[name="' + original_id  + '"]').length != 0) {
          target = $('[name="' + original_id  + '"]');
        }
        else {
          target = null;
        }

        // So, if the jump link actually points to something, let's
        // prepend it with a span tag that has a derivative id
        if (target != null) {
          target.before('<span id="' + original_id + '-jumplink-span" style="position: relative; display: block; visibility: hidden; margin-top: -' + span_height + 'px; height: ' + span_height + 'px;"></span>');
          // Now modify the jumplink to point to the span instead of the
          // original element.
          $(this).attr('href', $(this).attr('href') + '-jumplink-span');
        }
      }
    });
  });
})(jQuery, this);
