var ObjectStorage = require('../lib/objectstorage');
var ACL = require('../lib/objectstorage/acl');
var Container = require('../lib/objectstorage/container');
var IdentityService = require('../lib/identityservices');
var config = require('./config');
var LocalObject = require('../lib/objectstorage/localobject');
var ObjectInfo = require('../lib/objectstorage/objectinfo');
var Subdir= require('../lib/objectstorage/subdir');

// For testing.
var assert = require('assert');
var pronto = require('pronto');
var Closure = require('../node_modules/pronto/lib/commands/closure');
var Test = require('./testcommand');

var fs = require('fs');

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
      assert.ok(container.count() >= 0);
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
      assert.ok(container.count() >= 0);
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
    var container = cxt.get('v2');
    var name = 'TEST-CONTAINER.js';
    var handle = fs.createReadStream('./test/test-container.js');
    // Test a larger payload.
    //var handle = fs.createReadStream('/var/log/dpkg.log');

    // When the stream is open, do the test.
    handle.on('open', function () {
      var o = new LocalObject(name, 'application/javascript');
      o.setMetadata({
        'knock-knock': 'whos there',
        'orange': 'orange who',
        'orange-you-glad': 'I didnt say banana.'
      });
      o.setDisposition('attachment; filename=foo.js');
      o.setContent(handle);

      container.save(o, function (e) {
        if (e) {
          console.log(e);
          thisTest.failed();
        }
        assert.ok(true);
        thisTest.passed();
      });
    });

    // If the stream errors out, die.
    handle.on('error', function (e) {
      thisTest.failed("Cannot get the file contents.");
      return;
    });

  })
  .does(Test, 'testObjectInfo').using('fn', function (cxt, params, thisTest) {
    var container = cxt.get('v2');
    container.objectInfo('TEST-CONTAINER.js', function (e, info) {
      if(e) {
        thisTest.failed(e);
      }
      console.log(info);
      assert.equal('application/javascript', info.contentType());
      assert.equal('TEST-CONTAINER.js', info.name());
      assert.ok(info.contentLength() > 0);
      assert.ok(info.eTag().length > 0);
      assert.ok(info.lastModified().length > 0);
      thisTest.passed();
    });
  })
  .does(Test, 'testObjects').using('fn', function (cxt, params, thisTest) {
    var container = cxt.get('v1');
    container.objects(function (e, list) {
      assert.ok(list.length > 0);
      console.log(list);

      var info;
      for (var i = 0; i < list.length; ++i) {
        if (list[i].name() == 'TEST-CONTAINER.js') {
          info = list[i];
        }
      }
      assert.ok(info instanceof ObjectInfo);
      assert.equal('application/javascript', info.contentType());
      assert.equal('TEST-CONTAINER.js', info.name());
      assert.ok(info.contentLength() > 0);
      assert.ok(info.eTag().length > 0);
      assert.ok(info.lastModified().length > 0);

      thisTest.passed();
    });
  })
  .does(Test, 'testProxyObject').using('fn', function (cxt, params, thisTest) {
    thisTest.skipped();
  })
  .does(Test, 'testRemoteObject').using('fn', function (cxt, params, thisTest) {
    thisTest.skipped();
  })
  .does(Test, 'testUpdateObjectMetadata').using('fn', function (cxt, params, thisTest) {
    thisTest.skipped();
  })
  .does(Test, 'testCopy').using('fn', function (cxt, params, thisTest) {
    thisTest.skipped();
  })
  .does(Test, 'testObjectsWithPrefix').using('fn', function (cxt, params, thisTest) {
    thisTest.skipped();
  })
  .does(Test, 'testObjectsByPath').using('fn', function (cxt, params, thisTest) {
    thisTest.skipped();
  })
  .does(Test, 'testDeleteObject').using('fn', function (cxt, params, thisTest) {
    Transport.debug = true;
    var container = cxt.get('v1');
    container.delete('TEST-CONTAINER.js', function (e, success){
      if (e) {
        thisTest.failed();
        return;
      }
      if (!success) {
        thisTest.failed('Could not delete');
        return;
      }
      thisTest.passed();
    });
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
