/**
 * The IdenitytServices implementation.
 */
var URL = require('url');

module.exports = IdentityServices;

function IdentityServices(endpoint) {
  this.endpoint= endpoint;
}

/**
 * Get the endpoint URL.
 */
IdentityServices.prototype.url= function () {
  return this.endpoint;
}
/**
 * Authenticate to a server.
 */
IdentityServices.prototype.authenticate = function (options, fn) {
  var url = this.endpoint + '/tokens';
  var envelope = {
    auth: options
  };

  var body = JSON.stringify(envelope);


  var opts = URL.parse(url);

  opts.method = 'POST';
  opts.headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Content-Length': body.length
  };

  var req = http.request(opts, fn);

  // FIXME: Use better error handling.
  req.on('error', function (e) {
    console.log('FAILED: ' + e.message);
  });

  req.write(body);
  req.end();
}

/**
 * Authenticate using user/password.
 */
IdentityServices.prototype.authenticateAsUser = function (user, password, projectId = null) {}
/**
 * Authenticate using account/secret keys.
 */
IdentityServices.prototype.authenticateAsAccount = function (account, secret, projectId = null) {}


IdentityServices.prototype.token = function () {}


IdentityServices.prototype.tenantId = function () {}
IdentityServices.prototype.tenantName = function () {}
IdentityServices.prototype.tenants = function () {}

IdentityServices.prototype.tokenDetails = function () {}
IdentityServices.prototype.isExpired = function () {}
IdentityServices.prototype.serviceCatalog = function () {}
IdentityServices.prototype.user = function () {}


IdentityServices.prototype.rescopeUsingTenantId = function (projectId) {}
IdentityServices.prototype.rescopeUsingTenantName = function (projectId) {}
