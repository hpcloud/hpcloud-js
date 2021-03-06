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

module.exports = Identity;

/**
 * Identity object. Identity objects represent an individual identity from
 * Identity Services.
 *
 * @class Identity
 * @constructor
 *
 * @param {Object} jsonObject The JSON respone from Identity Services.
 */
function Identity(jsonObject) {
  this.data = jsonObject;
}

/**
 * Get the token.
 *
 * @method token
 * @return {String} The token.
 */
Identity.prototype.token = function () {
  return this.data.access.token.id;
};

/**
 * Check if the current token has expired.
 *
 * @method isExpired
 * @return {Boolean} TRUE if the token as expired and FALSE if still valid.
 */
Identity.prototype.isExpired = function () {
  var expires = this.data.access.token.expires;
  var expTime = Date.parse(expires);
  return expTime < Date.now();
};

/**
 * Get the current tenantId.
 *
 * @method tenantId
 * @return {String} The tenantId.
 */
Identity.prototype.tenantId = function () {
  return this.data.access.token.tenant.id;
};

/**
 * Get the current tenantName.
 *
 * @method tenantName
 * @return {String} The tenantName.
 */
Identity.prototype.tenantName = function () {
  return this.data.access.token.tenant.name;
};

/**
 * The details around a token including expires, tenant, etc.
 *
 * @method tokenDetails
 * @return {Object} An object with the details about the token.
 */
Identity.prototype.tokenDetails = function () {
  return this.data.access.token;
};

/**
 * The catalog of activated services.
 *
 * @method serviceCatalog
 * @return {Object} The service catalog.
 */
Identity.prototype.serviceCatalog = function () {
  return this.data.access.serviceCatalog;
};

/**
 * Given a service name, get the service endpoint.
 *
 * This also takes a zone name.
 *
 * @method serviceByName
 * @param {string} name The name of the service, e.g. 'objectStorage' or 'ext:cdn'.
 * @param {string} region The name of the availability zone, e.g. 'az-1.region-a.geo-1'
 *
 * @return {object} The service record.
 */
Identity.prototype.serviceByName = function (name, region) {

  var catalog = this.serviceCatalog();

  var entry;
  for (var i = 0; i < catalog.length; ++i) {
    if (catalog[i].type == name) {
      entry = catalog[i];
    }
  }

  if (!entry) {
    throw new Error('No such service: ' + name);
  }

  if (region) {

    for (var i = 0; i < entry.endpoints.length; ++i) {
      if (entry.endpoints[i].region == region) {
        return entry.endpoints[i];
      }
    }

    if (!entry) {
      throw new Error('No service found in region ' + region);
    }
  }

  return entry.endpoints[0];
};

/**
 * Get the user object.
 *
 * @method user
 * @return {Object} The user object.
 */
Identity.prototype.user = function () {
  return this.data.access.user;
};

/**
 * Get the user roles
 *
 * @method roles
 * @return {Array} The roles a user has.
 */
Identity.prototype.roles = function () {
  return this.user().roles;
};
