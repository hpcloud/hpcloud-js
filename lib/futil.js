/* ============================================================================
(c) Copyright 2013 Hewlett-Packard Development Company, L.P.
Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights to
use, copy, modify, merge,publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software is furnished to do so,
subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR 
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.  IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE  LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
============================================================================ */
/**
 * Function utilities.
 */

var Futil = {};
module.exports = Futil;


/**
 * Re-scan an argument list with internal optional arguments and a trailing function.
 *
 * It is often considered best to have callback functions listed as the last argument
 * on a function call. This provides a way of re-setting arguments so that optional
 * arguments are set to 'undefined' and the function callback is moved to the far right
 * of the arguments list.
 *
 * Usage:
 *
 *   function example(a, b, c, callback) {
 *     var args = Futil.argsWithFn(arguments, ['a', 'b', 'c', 'callback']);
 *
 *     console.log("a: %s, b: %s, c: %s, callback: %s", args.a, args.b, args.c, args.callback);
 *   }
 *
 *   // Call like this...
 *   example(1, function(){});
 *   // Output:
 *   // a: 1, b: undefined, c: undefined, callback: function (){}
 */
Futil.argsWithFn = function (args, names) {
  var newArgs = {};
  var found = false;
  for (var i = args.length - 1; i >= 0; --i) {
    if (!found && typeof args[i] == 'function') {
      var fn = args[i];
      newArgs[names[i]] = undefined;
      newArgs[names[names.length - 1]] = fn;
      found = true;
    }
    else {
      newArgs[names[i]] = args[i];
    }
  }
  return newArgs;
}

