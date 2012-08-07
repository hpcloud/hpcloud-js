var ObjectStorage = require('../lib/objectstorage');
var IdentityService = require('../lib/identityservices');
var config = require('./config');

function test(e, identity) {

  //console.log(identity);
  var store = ObjectStorage.newFromIdentity(identity, 'region-a.geo-1');

  console.log(store);

}

var is = new IdentityService(config.identity.endpoint);

is
  .setTenantId(config.identity.tenantid)
  .authenticateAsAccount(config.identity.account, config.identity.secret, test);
