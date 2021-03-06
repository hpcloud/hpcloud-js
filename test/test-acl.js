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

var assert = require('assert');
var ACL = require('../lib/objectstorage/acl');
var conf = require('./config');

// Constructor

var acl = new ACL();
assert.equal(0, acl.rules.length);

// addAccount

acl.addAccount(ACL.READ, 'test');
assert.equal(1, acl.rules.length);

assert.equal(ACL.READ, acl.rules[0].mask);
assert.equal('test', acl.rules[0].account);

acl = new ACL();
acl.addAccount(ACL.WRITE, 'admin', 'earnie');

assert.equal(ACL.WRITE, acl.rules[0].mask);
assert.equal('admin', acl.rules[0].account);
assert.equal('earnie', acl.rules[0].user);

acl = new ACL();
acl.addAccount(ACL.WRITE, 'admin', ['earnie', 'bert']);

assert.equal(ACL.WRITE, acl.rules[0].mask);
assert.equal('admin', acl.rules[0].account);
assert.equal('earnie', acl.rules[0].user[0]);
assert.equal('bert', acl.rules[0].user[1]);

// addReferrer

acl = new ACL();
acl.addReferrer(ACL.READ, '.example.com');
acl.addReferrer(ACL.READ_WRITE, '-bad.example.com');

assert.equal(2, acl.rules.length);

assert.equal(ACL.READ, acl.rules[0].mask);
assert.equal('.example.com', acl.rules[0].host);

// allowListings

acl = new ACL();
acl.allowListings();
assert.ok(acl.rules[0].rlistings);
assert.equal(ACL.READ, acl.rules[0].mask);

// headers

acl = new ACL();
acl.addAccount(ACL.READ_WRITE, 'test');
var headers = acl.headers();
assert.equal(2, Object.keys(headers).length);

var read = headers[ACL.HEADER_READ];
var write = headers[ACL.HEADER_WRITE];

assert.equal('test', read);
assert.equal('test', write);

acl = new ACL();
acl.addReferrer(ACL.READ_WRITE, '.example.com');
headers = acl.headers();

assert.equal(1, Object.keys(headers).length);
read = headers[ACL.HEADER_READ];
assert.equal('.r:.example.com', read);

// makePublic, isPublic

acl = ACL.makePublic();
assert.equal('X-Container-Read: .r:*,.rlistings', acl.toString());
assert.ok(acl.isPublic());

// makePrivate, isPrivate

acl = ACL.makePrivate();
assert.equal(0, acl.rules.length);
assert.ok(acl.isPrivate());

// newFromHeaders
headers = {};
headers[ACL.HEADER_READ] = '.r:.example.com,.rlistings,.r:-*.evil.net';
headers[ACL.HEADER_WRITE] = 'testact2, testact3:earnie, .rlistings  ';

acl = ACL.newFromHeaders(headers);

assert.equal(ACL.READ, acl.rules[0].mask)
assert.equal('.example.com', acl.rules[0].host);
assert.ok(acl.rules[1].rlistings);
assert.equal('-*.evil.net', acl.rules[2].host);
assert.equal(ACL.WRITE, acl.rules[3].mask);
assert.equal('testact3', acl.rules[4].account);
assert.ok(acl.rules[5].rlistings);

var newHeaders = acl.headers();
read = newHeaders[ACL.HEADER_READ];
write = newHeaders[ACL.HEADER_WRITE];

assert.equal('.r:.example.com,.rlistings,.r:-*.evil.net', read);
assert.equal('testact2,testact3:earnie', write);
