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
 * Unit test support.
 */

var pronto = require('pronto');
module.exports = TestCommand;
function TestCommand(){}
pronto.inheritsCommand(TestCommand);

/**
 * Execute a single test.
 *
 * Usage:
 *
 * runner.doCommand(TestCommand, 'myTest').using('fn', function(context, params, testStatus) {
 *   assert.ok(true);
 *   testStatus.passed('It passed!')
 *
 *   // Or...
 *   testStatus.failed('Bummer.');
 * });
 *
 * Note that passing merely indicates that the next text should run. It doesn't suggest that
 * all of the assertions you wrote have passed.
 *
 * Failure causes the test chain to stop.
 */
TestCommand.prototype.execute = function(context, params) {
  var format = {
    // Yellow
    status: '\033[00;33m%s\033[0m',
    // Red
    error: '\033[00;31m%s\033[0m',
    // Green
    ok: '\033[00;32m%s\033[0m',
    missed: '\033[00;36m%s\033[0m'
  };

  this.required(params, ['fn']);
  console.log(format.status, '==> Running ' + this.name);

  var fn = params.fn;
  var cmd = this;

  var result = {
      passed: function (msg) {
        var message = msg || '';
        console.log(format.ok, '<== Completed test ' + cmd.name + '. ' + message);
        cmd.done();
      },
      failed: function(msg) {
        var message = msg || '';
        console.log(format.error, '<<< FAILED test ' + cmd.name + '. ' + message);
        cmd.stop();
      },
      skipped: function(msg) {
        var message = msg || '';
        console.log(format.missed, '<<< SKIPPED test ' + cmd.name + '. ' + message);
        cmd.done();
      }

  }

  fn(context, params, result);
}
