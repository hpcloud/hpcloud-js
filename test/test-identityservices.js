var assert = require('assert');
var IdentityServices = require('../lib/identityservices');
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
idservice.authenticate(opts, function (identity) {

  console.log(identity);

  assert.equal(identity.tenantId(), conf.identity.tenantid);
  //assert.equal(identity.tenantName(), conf.identity.tenantname);
  assert.equal(identity.user().name, conf.identity.username);
  assert.ok(0 < identity.serviceCatalog().length);
  assert.ok(identity.tenantName().length > 0);
  assert.ok(identity.token().length > 0);
});
