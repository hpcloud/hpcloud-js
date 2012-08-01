var assert = require('assert');
var IdentityServices = require('../lib/identityservices');
var Identity = require('../lib/identity');
var conf = require('./config');

assert.notEqual(0, conf.identity.endpoint.length);

var idservice = new IdentityServices(conf.identity.endpoint);

var opts = {
  apiAccessKeyCredentials: {
    accessKey: conf.identity.account,
    secretKey: conf.identity.secret
  },
  tenantId: conf.identity.tenantid
}
console.log(opts);
idservice.authenticate(opts, function (success, identity) {

  if (!success) {
    console.log('Identification failed: %d, %s', arguments[1], arguments[2]);
    assert.ok(false);
    return;
  }

  console.log(identity);

  assert.equal(identity.tenantId(), conf.identity.tenantid);
  //assert.equal(identity.tenantName(), conf.identity.tenantname);
  assert.equal(identity.user().name, conf.identity.username);
  assert.ok(0 < identity.serviceCatalog().length);
  assert.ok(identity.tenantName().length > 0);
  assert.ok(identity.token().length > 0);
});

/**
 * Test authenticating as a User.
 */
var idservice_testAccountAuth = new IdentityServices(conf.identity.endpoint);

idservice_testAccountAuth.setTenantId(conf.identity.tenantid).authenticateAsUser(conf.identity.username, conf.identity.password, function (success, identity) {

  if (!success) {
    console.log('Identification failed: %d, %s', arguments[1], arguments[2]);
    assert.ok(false);
    return;
  }

  console.log(identity);

  assert.equal(identity.tenantId(), conf.identity.tenantid);
  //assert.equal(identity.tenantName(), conf.identity.tenantname);
  assert.equal(identity.user().name, conf.identity.username);
  assert.ok(0 < identity.serviceCatalog().length);
  assert.ok(identity.tenantName().length > 0);
  assert.ok(identity.token().length > 0);
});

/**
 * Test authenticating as a User.
 */
var idservice_testUserAuth = new IdentityServices(conf.identity.endpoint);

idservice_testUserAuth.setTenantId(conf.identity.tenantid).authenticateAsAccount(conf.identity.account, conf.identity.secret, function (success, identity) {

  if (!success) {
    console.log('Identification failed: %d, %s', arguments[1], arguments[2]);
    assert.ok(false);
    return;
  }

  console.log(identity);

  assert.equal(identity.tenantId(), conf.identity.tenantid);
  //assert.equal(identity.tenantName(), conf.identity.tenantname);
  assert.equal(identity.user().name, conf.identity.username);
  assert.ok(0 < identity.serviceCatalog().length);
  assert.ok(identity.tenantName().length > 0);
  assert.ok(identity.token().length > 0);
});
