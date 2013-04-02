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
 * The HP Cloud JS module provides Node.js APIs for HP Cloud's services.
 *
 * HP Cloud is based on OpenStack, but has a number of extensions, such as
 * CDN integration and Database as a Service (DBaaS). This library provides
 * a consistent, tested interface to HP Cloud's flavor of OpenStack. Many of
 * these libraries will also work with vanilla OpenStack.
 *
 * In general, working with this library is done like this:
 *
 * - Use the IdentityServices library to authenticate to the HP Cloud.
 * - Pass the resulting Identity object to one or more of the service
 *   libraries to work with those services.
 *
 * For example, to list the containers you have in Object Storage, you might
 * do something like this:
 *
 * ```
 *  // The IdentityService is necessary to connect to the HP Cloud.
 *  var IdentityService = require('../lib/identityservices');
 *
 *  // These two are for ObjectStorage.
 *  var ObjectStorage = require('../lib/objectstorage');
 *  var Container = require('../lib/objectstorage/container');
 *
 *   // Create a new IdentityService service. Give it the URL to your
 *   // HP CLoud endpoint.
 *   var is = new IdentityService("https://...");
 *   // Point it to a particular tenant ID.
 *   is.setTenantId("12345678");
 *
 *   // Using key and shared secret, log in. There is another function that
 *   // allows you to use login/password if you wish.
 *   is.authenticateAsAccount("123accountID", "321Secret", function (e, id) {
 *     // Now that we have an identity object (id), we can create a new
 *     // ObjectStorage instance and access our object store. We need to
 *     // tell it which region to use, since there are multiple regions.
 *     var store = ObjectStorage.newFromIdentity(id, 'region-a.geo-1');
 *     // Now that we have a handle to our object store, we can do whatever
 *     // object storage operations we want. For example, we can get a list of
 *     // the current containers in this region:
 *     store.containers(function(e, list) {
 *       // Do something with the list of containers.
 *     });
 *   });
 * 
 * ```
 *
 * The above is a good example of the typical patterns used for working with the
 * HP Cloud bindings. As with most good Node.js libraries, the HPCloud-JS library
 * is asynchronous wherever possible.
 *
 * For more good examples of working with the HPCloud-JS APIs, see the tests in
 * the `test/` directory. For example, `test/test-objectstorage.js` exercises
 * the entire ObjectStorage API.
 *
 * ## Interested in Contributing?
 *
 * This project is open source, and we welcome new contributors. Just drop by
 * the issue queue and introduce yourself.
 *
 *
 * @main hpcloud
 * @module hpcloud
 */

var IdentityServices = require('./identityservices');
var Identity = require('./identity');

exports.IdentityServices = IdentityServices;
exports.Identity = Identity;
exports.ObjectStorage = require('./objectstorage');
