/**
 * Test Object Storage.
 *
 * These tests use Pronto to manage the async callbacks.
 *
 * How to read this:
 *
 * - Each line that begins with '.does()' represents the beginning of a
 *   new test.
 * - Each test is actually just a closure that executes a self-contained
 *   step in the test.
 * - As each test is finished, it calls cmd.done() to let Pronto know
 *   that it can move on to the next test.
 * - Each step in the chain of does() commands is executed
 *   asynchronously.
 */

var ObjectStorage = require('../lib/objectstorage');
var ACL = require('../lib/objectstorage/acl');
var IdentityService = require('../lib/identityservices');
var config = require('./config');

// For testing.
var assert = require('assert');
var pronto = require('pronto');
var Closure = require('../node_modules/pronto/lib/commands/closure');

var reg = new pronto.Registry();
reg.route('tests')

  // Do authentication.
  .does(Closure, 'CreateIdentity').using('fn', function (cxt, params, cmd) {
    var is = new IdentityService(config.identity.endpoint);
    is
      .setTenantId(config.identity.tenantid)
      .authenticateAsAccount(config.identity.account, config.identity.secret, function (e, i) {
        // Store the identity.
        cxt.add('identity', i);
        cmd.done();
                            
      });
  })

  // Setup object storage.
  .does(Closure, 'SetupObjectStore').using('fn', function (cxt, params, cmd) {
    // Setup
    var identity = cxt.get('identity');
    var store = ObjectStorage.newFromIdentity(identity, 'region-a.geo-1');
    cxt.add('store', store);

    // Make sure we don't have an old container hanging around.
    store.deleteContainer(config.swift.container, function (e, f) {
      cmd.done();
    });
  })
  .does(Closure, 'testDecodeContainerMetadata').using('fn', function (cxt, params, cmd) {
    var test = {
      'x-container-meta-a': 'a',
      'x-container-meta-b': 'b',
      'x-container-meta-some-long-string': 'long value',
      'x-container-meta-c': 'string'
    };

    var md = ObjectStorage.ObjectStorage.decodeContainerMetadata(test);

    assert.equal('a', md.a);
    assert.equal('long value', md['some-long-string']);
  })

  // Create a container.
  .does(Closure, 'testCreateContainer').using('fn', function (cxt, params, cmd) {
    var store = cxt.get('store');
    var metadata = {
      'foo': 1,
      'bar': 'baz'
    }

    // Test creation of a container.
    var acl = ACL.makePrivate();
    store.createContainer(config.swift.container, acl, metadata, function (e, container) {
      // assert.fail(e);
      assert.ok(container.isNew);
      assert.equal(config.swift.container, container.name);
      assert.equal(store.endpoint + '/' + encodeURI(config.swift.container), container.url);

      cmd.done();
    });
  })

  // Test account info
  .does(Closure, 'testAccountInfo').using('fn', function (cxt, params, cmd) {
    var store = cxt.get('store');
    store.accountInfo(function (e, data) {
      console.log(data);
      assert.ok(data.objects);
      assert.ok(data.bytes);
      assert.ok(data.containers);

      cmd.done();
    });
  })

  // Delete a container.
  .does(Closure, 'testDeleteContainer').using('fn', function (cxt, params, cmd) {
    var store = cxt.get('store');
    store.deleteContainer(config.swift.container, function (e, f) {
      if (e) {throw e};
      assert.ok(f);

      cmd.done();
    });

  })
  ;

var router = new pronto.Router(reg);
router.handleRequest('tests');
