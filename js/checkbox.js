/*
 * This is a helper script for checkboxes.
 *
 * This script requires jQuery 1.4+
 */

(function($, undefined) {

var setuplabel = function() {
  var label = $("label[for='" + this.id + "']");

  // Make the label a checkbox
  label.addClass('input-checkbox-label');

  // Check the box
  if (this.checked) {
    label.addClass('isChecked');
  }

  // if disabled
  if (this.disabled) {
    label.addClass('isDisabled');
  }
};

var handlechecked = function() {
  var label = $("label[for='" + this.id + "']");

  // Check the box
  if (this.checked) {
    label.addClass('isChecked');
  }
  else {
    label.removeClass('isChecked');
  }
};

$('input[type="checkbox"]').each(setuplabel).click(handlechecked);

})(jQuery);