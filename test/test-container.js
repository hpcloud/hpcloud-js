var ObjectStorage = require('../lib/objectstorage');
var ACL = require('../lib/objectstorage/acl');
var Container = require('../lib/objectstorage/container');
var IdentityService = require('../lib/identityservices');
var config = require('./config');

// For testing.
var assert = require('assert');
var pronto = require('pronto');
var Closure = require('../node_modules/pronto/lib/commands/closure');
var Test = require('./testcommand');

var reg = new pronto.Registry();
reg.route('tests')
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
  .does(Closure, 'SetupObjectStore').using('fn', function (cxt, params, status) {
    // Setup
    var identity = cxt.get('identity');
    var store = ObjectStorage.newFromIdentity(identity, 'region-a.geo-1');
    cxt.add('store', store);

    // Make sure we don't have an old container hanging around.
    store.deleteContainer(config.swift.container, function (e, f) {
      status.done();
    });
  })
  // Create a container.
  .does(Closure, 'CreateContainer').using('fn', function (cxt, params, status) {
    var store = cxt.get('store');
    var metadata = {
      'foo': 1,
      'bar': 'baz'
    }

    var acl = ACL.makePrivate();
    store.createContainer(config.swift.container, acl, metadata, function (e, container) {
      status.done();
    })
  })
  .does(Test, 'testContainerFromJSON').using('fn', function (cxt, params, status) {
    var store = cxt.get('store');
    store.containers(function (e, list) {
      assert.ok(list.length > 0);

      var container;
      for (var i = 0; i < list.length; ++i) {
        if (list[i].name() == config.swift.container) {
          container = list[i];
          break;
        }
      }

      assert.ok(container != undefined);

      // The following attributes are set in JSON: name, count, bytes.
      assert.ok(container.count() == 0);
      assert.ok(container.bytes() >= 0);
      // Duplicate: assert.equal(container.name() == config.swift.container);

      cxt.add('v1', container);
      status.passed();
    });
  })
  .does(Test, 'testContainerFromResponse').using('fn', function (cxt, params, status) {
    var store = cxt.get('store');
    store.container(config.swift.container, function (e, container) {
      cxt.add('v2', container);

      assert.ok(container != undefined);

      // The following attributes are set in JSON: name, count, bytes.
      assert.ok(container.count() == 0);
      assert.ok(container.bytes() >= 0);
      // Duplicate: assert.equal(container.name() == config.swift.container);

      status.passed();
    });

  })
  .does(Test, 'testMetadata').using('fn', function (cxt, params, status) {
    var v1 = cxt.get('v1');
    var v2 = cxt.get('v2');

    if (v1 == undefined || v2 == undefined) {
      status.failed();
    }

    v1.metadata(function (e, md) {
      assert.equal(1, md.foo);
      assert.equal('baz', md.bar);

      // This will require a server round-trip, so it'll be slower.
      status.passed();
    });
    v2.metadata(function (e, md) {
      assert.equal(1, md.foo);
      assert.equal('baz', md.bar);
    });

  })
  .does(Test, 'testACL').using('fn', function (cxt, params, status) {
    var v1 = cxt.get('v1');
    var v2 = cxt.get('v2');

    console.log(v2);

    // Both of these require a callback, so we nest the tests.
    v1.acl(function (e, acl) {
      assert.ok(acl.isPrivate());
      v2.acl(function (e, acl) {
        assert.ok(acl.isPrivate());
        status.passed();
      });
    });
  })
  .does(Test, 'testSave').using('fn', function (cxt, params, thisTest) {
    thisTest.skipped();
  })
  .does(Test, 'testUpdateObjectMetadata').using('fn', function (cxt, params, thisTest) {
    thisTest.skipped();
  })
  .does(Test, 'testCopy').using('fn', function (cxt, params, thisTest) {
    thisTest.skipped();
  })
  .does(Test, 'testProxyObject').using('fn', function (cxt, params, thisTest) {
    thisTest.skipped();
  })
  .does(Test, 'testRemoteObject').using('fn', function (cxt, params, thisTest) {
    thisTest.skipped();
  })
  .does(Test, 'testObjectsWithPrefix').using('fn', function (cxt, params, thisTest) {
    thisTest.skipped();
  })
  .does(Test, 'testObjectsByPath').using('fn', function (cxt, params, thisTest) {
    thisTest.skipped();
  })
  .does(Test, 'testDeleteObject').using('fn', function (cxt, params, thisTest) {
    thisTest.skipped();
  })


  .does(Closure, 'DeleteContainer').using('fn', function (cxt, params, status) {
    var store = cxt.get('store');
    store.deleteContainer(config.swift.container, function (e, f) {
      if (e) {throw e};
      assert.ok(f);

      status.done();
    });
  })


var router = new pronto.Router(reg);
router.handleRequest('tests');
