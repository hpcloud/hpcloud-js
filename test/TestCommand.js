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
  this.required(params, ['fn']);
  console.log('==> Running %s', this.name);

  var fn = params.fn;
  var cmd = this;

  var result = {
      passed: function (msg) {
        var message = msg || '';
        console.log('<== Completed test %s. %s', cmd.name, message);
        cmd.done();
      },
      failed: function(msg) {
        var message = msg || '';
        console.log('<<< FAILED test %s. %s', cmd.name, message);
        cmd.end();
      }
  }

  fn(context, params, result);
}
