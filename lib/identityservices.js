/**
 * The IdenitytServices implementation.
 */
var URL = require('url');
var HTTP = require('https');
var Identity = require('./identity');

module.exports = IdentityServices;

function IdentityServices(endpoint) {
  this.endpoint= endpoint;
  this.tenantName = null;
  this.tenantId = null;
}

/**
 * Set the tenant ID.
 *
 * Only one of tenant name and tenant ID should be set.
 *
 * This should be done *before* an authentication call.
 *
 * @param {String} id The tenantId to be used.
 *
 * @return {Object} The current object so this can be used in chaining.
 */
IdentityServices.prototype.setTenantId = function (id) {
  this.tenantId = id;

  return this;
}

/**
 * Get the tenantId.
 * 
 * @return {String} The tenantId.
 */
IdentityServices.prototype.tenantId = function () {
  return this.tenantId;
}

/**
 * Set the tenant Name.
 *
 * Only one of tenant name and tenant ID should be set.
 *
 * This should be done *before* an authentication call.
 *
 * @param {String} name The tenantName to be used.
 *
 * @return {Object} The current object so this can be used in chaining.
 */
IdentityServices.prototype.setTenantName = function (name) {
  this.tenantName = name;

  return this;
}

/**
 * Get the tenantName.
 * 
 * @return {String} The tenantName.
 */
IdentityServices.prototype.tenantName = function () {
  return this.tenantName;
}

/**
 * Get the endpoint URL.
 */
IdentityServices.prototype.url= function () {
  return this.endpoint;
}
/**
 * Authenticate to a server.
 *
 * This is a raw authentication method. It users ONLY the options passed
 * in to authenticate.
 *
 * The autheticateAs* methods are recommended.
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
  opts.headers = this.$basicHeaders();
  opts.headers['Content-Length'] = body.length;

  this.$request(opts, body, fn);
}

/**
 * Authenticate using user/password.
 *
 * To attach to a project (tenant), use setTenantId() or setTenantName()
 * first.
 *
 * @param {String} username The username to authenticate with.
 * @param {String} password The users password associated with the username.
 * @param {Function} fn A callback function to execute after a user authenticates.
 */
IdentityServices.prototype.authenticateAsUser = function (user, password, fn) {
  var obj = {
    passwordCredentials: {
      username: user,
      password: password
    }
  }
  this.$tenant(obj);

  return this.authenticate(obj, fn);
}
/**
 * Authenticate using account/secret keys.
 *
 * To attach to a project (tenant), use setTenantId() or setTenantName()
 * first.
 *
 * @param {String} account The account to authenticate with.
 * @param {String} secret The secret key associated with the account.
 * @param {Function} fn A callback function to execute after a user authenticates.
 */
IdentityServices.prototype.authenticateAsAccount = function (account, secret, fn) {
  var obj = {
    apiAccessKeyCredentials: {
      accessKey: account,
      secretKey: secret
    }
  }

  this.$tenant(obj);

  return this.authenticate(obj, fn);
}

IdentityServices.prototype.rescope = function (identity, fn) {
  var url = this.endpoint + '/tokens';

  // Get the token value.
  var token;
  if (typeof identity == 'string') {
    token = identity;
  }
  else {
    token = identity.token();
  }

  var obj = {
    auth: {
      token: {
        id: token
      }
    }
  };


  if (this.tenantId != null) {
    obj.tenantId = this.tenantId;
  }
  else if (this.tenantName != null) {
    obj.tenantName = this.tenantName;
  }

  var body = JSON.stringify(obj);

  // Prepare the request.
  var opts = URL.parse(url);
  opts.method = 'POST';
  opts.headers = this.$basicHeaders();
  opts.headers['Content-Length'] = body.length;
 
  this.$request(opts, body, fn);
}

/**
 * Do an identity request.
 */
IdentityServices.prototype.$request = function (opts, body, fn) {
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

IdentityServices.prototype.$basicHeaders = function () {
  return {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'User-Agent': 'hpcloud-js/1.0 (64d9)'
  };
}

IdentityServices.prototype.$tenant = function (obj) {
  if (this.tenantId != null) {
    obj.tenantId = this.tenantId;
  }
  else if (this.tenantName != null) {
    obj.tenantName = this.tenantName;
  }
}
