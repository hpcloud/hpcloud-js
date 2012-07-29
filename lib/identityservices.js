/**
 * The IdenitytServices implementation.
 */
var URL = require('url');
var HTTP = require('https');

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

  // Build the HTTP request options.
  var opts = URL.parse(url);
  opts.method = 'POST';
  opts.headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Content-Length': body.length
  };

  // Define the request.
  var req = HTTP.request(opts, function (response) {
    // We accept only 200.
    if (response.statusCode == 200) {
      var responseData = '';
      response.on('data', function (bytes) {
        responseData += bytes;
      });
      response.on('end', function() {
        var json = JSON.parse(responseData);
        var id = new Identity(json);
        fn(true, id);
      });
    }
    else {
      console.log("FAILED with HTTP status code %d", response.statusCode);
      fn(false, response.statusCode, 'HTTP Error.');
    }
  });

  // FIXME: Use better error handling.
  req.on('error', function (e) {
    console.log('FAILED outside of HTTP: ' + e.message);
    fn(false, 0, e.message);
  });

  // Write the body and trigger the request.
  req.write(body);
  req.end();
}

/**
 * Authenticate using user/password.
 */
IdentityServices.prototype.authenticateAsUser = function (user, password, projectId) {}
/**
 * Authenticate using account/secret keys.
 */
IdentityServices.prototype.authenticateAsAccount = function (account, secret, projectId) {}

function Identity(jsonObject) {
  this.data = jsonObject;
}


Identity.prototype.token = function () {
  return this.data.access.token.id;
}
Identity.prototype.isExpired = function () {
  var expires = this.data.access.token.expires;
  var expTime = Date.parse(expires);
  return expTime < Date.now();
}


Identity.prototype.tenantId = function () {
  return this.data.access.token.tenant.id;
}
Identity.prototype.tenantName = function () {
  return this.data.access.token.tenant.name;
}
Identity.prototype.tokenDetails = function () {
  return this.data.access.token;
}

Identity.prototype.serviceCatalog = function () {
  return this.data.access.serviceCatalog;
}

Identity.prototype.user = function () {
  return this.data.access.user;
}

Identity.prototype.tenants = function (fn) {
  
}



IdentityServices.prototype.rescopeUsingTenantId = function (projectId) {}
IdentityServices.prototype.rescopeUsingTenantName = function (projectId) {}
