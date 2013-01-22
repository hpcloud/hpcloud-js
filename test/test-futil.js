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

var Futil = require('../lib/futil');
var assert = require('assert');

function testGetFn(first, second, third, fourth) {

  var a = Futil.argsWithFn(arguments, ['first','second', 'third', 'fourth']);

  //console.log("First: %s, Second, %s, Third: %s, Fourth: %s", a.first, a.second, a.third, a.fourth);

  var fn = a.fourth;
  fn();

  return a;

}

var res = testGetFn('a', 'b', 'c', function (){});
assert.equal('a', res.first);
assert.equal('b', res.second);
assert.equal('c', res.third);

assert.ok(typeof res.fourth == 'function');


res = testGetFn('a', 'b', function (){});
assert.equal('a', res.first);
assert.equal('b', res.second);
assert.ok(res.third == undefined);

assert.ok(typeof res.fourth == 'function');

// Test with misplaced trailing arg.
res = testGetFn('a', 'b', function (){}, 'd');
assert.equal('a', res.first);
assert.equal('b', res.second);
assert.ok(res.third == undefined);

assert.ok(typeof res.fourth == 'function');

// Test with only one arg.
res = testGetFn(function(){});
assert.ok(res.first == undefined);
assert.ok(res.second == undefined);
assert.ok(res.third == undefined);

assert.ok(typeof res.fourth == 'function');

// Test with two functions
res = testGetFn(function(){console.log('FAILED')}, null, null, function(){});
assert.ok(typeof res.first == 'function');
assert.ok(res.second == undefined);
assert.ok(res.third == undefined);

assert.ok(typeof res.fourth == 'function');


