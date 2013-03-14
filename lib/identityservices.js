/* ============================================================================
(c) Copyright 2013 Hewlett-Packard Development Company, L.P.
Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights to
use, copy, modify, merge,publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software is furnished to do so,
subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR 
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.  IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE  LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
============================================================================ */
/**
 * The IdenitytServices implementation.
 */
var URL = require('url');
var HTTP = require('https');
var Identity = require('./identity');
var Transport = require('./transport');

module.exports = IdentityServices;

/**
 * Interact with Identity Services (a.k.a. Keystone) for authentication, obtaining
 * the service catalog, etc.
 * 
 * @class IdentityServices
 * @constructor
 *
 * @param {String} endpoint An identity services url endpoint.
 */
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
 * @chainable
 * @method setTenantId
 *
 * @param {String} id The tenantId to be used.
 *
 * @return {Object} The current object so this can be used in chaining.
 */
IdentityServices.prototype.setTenantId = function (id) {
  this.tenantId = id;

  return this;
};

/**
 * Verify that the CN on the SSL certificate is for IdentityServices.
 */
IdentityServices.prototype.verifyCN = true;

/**
 * Get the tenantId.
 *
 * @method tenantId
 * 
 * @return {String} The tenantId.
 */
IdentityServices.prototype.tenantId = function () {
  return this.tenantId;
};

/**
 * Set the tenant Name.
 *
 * Only one of tenant name and tenant ID should be set.
 *
 * This should be done *before* an authentication call.
 *
 * @chainable
 * @method setTenantName
 *
 * @param {String} name The tenantName to be used.
 *
 * @return {Object} The current object so this can be used in chaining.
 */
IdentityServices.prototype.setTenantName = function (name) {
  this.tenantName = name;

  return this;
};

/**
 * Get the tenantName.
 *
 * @method tenantName
 * 
 * @return {String} The tenantName.
 */
IdentityServices.prototype.tenantName = function () {
  return this.tenantName;
};

/**
 * Get the endpoint URL.
 *
 * @method url
 * @return {String} The endpoint URL to Identity Services.
 */
IdentityServices.prototype.url= function () {
  return this.endpoint;
};

/**
 * Authenticate to a server.
 *
 * This is a raw authentication method. It users ONLY the options passed
 * in to authenticate.
 *
 * The autheticateAs* methods are recommended.
 *
 * @method authenticate
 * @async
 *
 * @param {Object} options The options to use when authenticating.
 * @param {Function} fn The callback function to execute after authentication. The
 *   callback accepts two params. The first is error and contains the error if
 *   there is one. If the request was successful the first param is false and
 *   the second param is an Identity object.
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
};

/**
 * Authenticate using user/password.
 *
 * To attach to a project (tenant), use setTenantId() or setTenantName()
 * first.
 *
 * @method authenticateAsUser
 * @async
 *
 * @param {String} username The username to authenticate with.
 * @param {String} password The users password associated with the username.
 * @param {Function} fn A callback function to execute after a user authenticates.
 *   The callback accepts two params. The first is error and contains the error if
 *   there is one. If the request was successful the first param is false and
 *   the second param is an Identity object.
 */
IdentityServices.prototype.authenticateAsUser = function (user, password, fn) {
  var obj = {
    passwordCredentials: {
      username: user,
      password: password
    }
  };
  this.$tenant(obj);

  return this.authenticate(obj, fn);
};

/**
 * Authenticate using account/secret keys.
 *
 * To attach to a project (tenant), use setTenantId() or setTenantName()
 * first.
 *
 * @method authenticateAsAccount
 * @async
 *
 * @param {String} account The account to authenticate with.
 * @param {String} secret The secret key associated with the account.
 * @param {Function} fn A callback function to execute after a user authenticates.
 *   The callback accepts two params. The first is error and contains the error if
 *   there is one. If the request was successful the first param is false and
 *   the second param is an Identity object.
 */
IdentityServices.prototype.authenticateAsAccount = function (account, secret, fn) {
  var obj = {
    apiAccessKeyCredentials: {
      accessKey: account,
      secretKey: secret
    }
  };

  this.$tenant(obj);

  return this.authenticate(obj, fn);
};

/**
 * Rescope a user from one tenant to another.
 *
 * @method rescope
 * @async
 *
 * @param {Identity} identity The Identity object
 * @param {Function} fn A callback function to execute after rescoping the identity.
 */
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

  // Why is this inside auth now? Come on, Keystone!
  if (this.tenantId != null) {
    obj.auth.tenantId = this.tenantId;
  }
  else if (this.tenantName != null) {
    obj.auth.tenantName = this.tenantName;
  }

  var body = JSON.stringify(obj);

  // Prepare the request.
  var opts = URL.parse(url);
  opts.method = 'POST';
  opts.headers = this.$basicHeaders();
  opts.headers['Content-Length'] = body.length;

  this.$request(opts, body, fn);
};

/**
 * Get the list of tenants for an identity.
 *
 * A tenant object looks like this:
 *
 * @method tenants
 * @async
 * @example
 *   {
 *     id: 'TENANT_ID',
 *     name: 'TENANT NAME',
 *     enabled: true,
 *     created: TIMESTAMP,
 *     updated: TIMESTAMP
 *   }
 *
 *
 * @param {object} identity An identity object.
 * @param {Function} fn The callback function. This will be invoked with a list
 *   of tenant objects: `fn(error, tenants)`
 * @return {Array} An array of tenant objects.
 */
IdentityServices.prototype.tenants = function (identity, fn) {
  var url = this.endpoint + '/tenants';
  var opts = URL.parse(url);
  opts.method = 'GET';
  opts.headers = this.$basicHeaders();
  opts.headers['X-Auth-Token'] = identity.token();

  Transport.doRequest(opts, '', function (e, response, data) {
    var json;
    if (e) {
      fn(e);
      return;
    }


    json = JSON.parse(data);

    fn(false, json.tenants);

  });

};

/**
 * Verify that the certificate is an HPCloud certificate.
 *
 * This verification check was added to double-check for spoofing by a legit certificate.
 */
IdentityServices.prototype.isVerifiedCN = function (certificate) {
  var cn = certificate.subject.CN;
  // console.log("Verifying %s", cn);
  // CN should be of the form REGION.GEO.identity.hpcloudsvc.com
  return cn.search(/^region-[a-z]+\.geo-[1-9]+\.identity\.hpcloudsvc.com$/i) === 0;
}

/**
 * Do an identity request.
 *
 * *This is an internal method that should not be called by other methods.*
 *
 * @method $request
 * @private
 * @async
 *
 * @param {Object} opts An object with the opts to pass to the transport layer.
 * @param {String} body The body of the request. If JSON than in string form.
 * @param {Function} fn A callback function to execute after the request. The
 *   callback accepts two params. The first is error and contains the error if
 *   there is one. If the request was successful the first param is false and
 *   the second param is an Identity object.
 */
IdentityServices.prototype.$request = function (opts, body, fn) {
  var self = this;

  // Use Transport.
  Transport.doRequest(opts, body, function (e, response, data) {
    // We pass the savings on to you.
    if (e) {
      fn(e);
      return;
    }

    // Verify that this is an HP Cloud Identity Services endpoint. This is an extra security
    // measure to prevent SSL spoofing.
    if (self.verifyCN && !self.isVerifiedCN(response.socket.getPeerCertificate())) {
      var sece = new Error("Security error: Certificate is not an HPCloud certificate.");
      fn(sece);
      return;
    }

    var json = JSON.parse(data);
    fn(false, new Identity(json));

  });

  // Define the request.
  /*
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
 */
};

/**
 * The basic headers to use when making calls.
 *
 * *This is an internal method that should not be called by other methods.*
 *
 * @todo Should this be moved inside the transport layer?
 * @method $basicHeaders
 * @private
 * @return {Object} An object with the basic headers.
 */
IdentityServices.prototype.$basicHeaders = function () {
  return {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'User-Agent': 'hpcloud-js/1.0 (64d9)'
  };
};

/**
 * Attach a tenant to an object. This is a helper method used when authenticating.
 *
 * *This is an internal method that should not be called by other methods.*
 *
 * @method $tenant
 * @private
 * @param  {Object} obj The object to attach tenant information to.
 */
IdentityServices.prototype.$tenant = function (obj) {
  if (this.tenantId != null) {
    obj.tenantId = this.tenantId;
  }
  else if (this.tenantName != null) {
    obj.tenantName = this.tenantName;
  }
};
