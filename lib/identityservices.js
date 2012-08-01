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
 *
 * @param {String} username The username to authenticate with.
 * @param {String} password The users password associated with the username.
 * @param {tenantId} The tenantId to authenticate with.
 * @param {Function} fn A callback function to execute after a user authenticates.
 */
IdentityServices.prototype.authenticateAsUser = function (username, password, tenantid, fn) {

  var options = {
    passwordCredentials: {
      username: username,
      password: password
    },
    tenantId: tenantid
  }

  this.authenticate(options, fn);

}

/**
 * Authenticate using account/secret keys.
 *
 * @param {String} account The account to authenticate with.
 * @param {String} secret The secret key associated with the account.
 * @param {tenantId} The tenantId to authenticate with.
 * @param {Function} fn A callback function to execute after a user authenticates.
 */
IdentityServices.prototype.authenticateAsAccount = function (account, secret, tenantid, fn) {

  var options = {
    apiAccessKeyCredentials: {
      accessKey: account,
      secretKey: secret
    },
    tenantId: tenantid
  }

  this.authenticate(options, fn);
}

function Identity(jsonObject) {
  this.data = jsonObject;
}

/**
 * Get the token.
 * 
 * @return {String} The token.
 */
Identity.prototype.token = function () {
  return this.data.access.token.id;
}

/**
 * Check if the current token has expired.
 * 
 * @return {Boolean} TRUE if the token as expired and FALSE if still valid.
 */
Identity.prototype.isExpired = function () {
  var expires = this.data.access.token.expires;
  var expTime = Date.parse(expires);
  return expTime < Date.now();
}

/**
 * Get the current tenantId.
 * 
 * @return {String} The tenantId.
 */
Identity.prototype.tenantId = function () {
  return this.data.access.token.tenant.id;
}

/**
 * Get the current tenantName.
 * 
 * @return {String} The tenantName.
 */
Identity.prototype.tenantName = function () {
  return this.data.access.token.tenant.name;
}

/**
 * The details around a token including expires, tenant, etc.
 * 
 * @return {Object} An object with the details about the token.
 */
Identity.prototype.tokenDetails = function () {
  return this.data.access.token;
}

/**
 * The catalog of activated services.
 *
 * @return {Object} The service catalog.
 */
Identity.prototype.serviceCatalog = function () {
  return this.data.access.serviceCatalog;
}

/**
 * Get the user object.
 * 
 * @return {Object} The user object.
 */
Identity.prototype.user = function () {
  return this.data.access.user;
}

Identity.prototype.tenants = function (fn) {
  
}



IdentityServices.prototype.rescopeUsingTenantId = function (projectId) {}
IdentityServices.prototype.rescopeUsingTenantName = function (projectId) {}
