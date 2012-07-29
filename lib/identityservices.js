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


  var opts = URL.parse(url);

  opts.method = 'POST';
  opts.headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Content-Length': body.length
  };

  console.log(opts);
  console.log(body);

  var req = HTTP.request(opts, function (response) {
    if (response.statusCode == 200) {
      

    }
    else {
      console.log("FAILED with HTTP status code %d", request.statusCode);
    }

    var responseData = '';
    response.on('data', function (bytes) {
      responseData += bytes;
    });
    response.on('end', function() {
      var json = JSON.parse(responseData);
      var id = new Identity(json);
      fn(id);
    });
  });

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
