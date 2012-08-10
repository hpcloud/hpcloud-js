exports.version = "0.1.0";

var URL = require('url');
var Util = require('util');

exports.Container = require('./container');
exports.LocalObject = require('./localobject');
exports.RemoteObject = require('./remoteobject');
exports.ProxyObject = require('./proxyobject');


exports.newFromIdentity = newFromIdentity;
exports.ObjectStorage = ObjectStorage;

/**
 * Create a new ObjectStorage instance from an IdentityServices
 * Identity.
 *
 * @param {Identity} identity
 *   An identity with a service catalog.
 * @param {string} region
 *   The availability zone. e.g. 'az-1.region-a.geo-1'. If this is
 *   omitted, the first available object storage will be used.
 * @param {Function} fn
 *   A callback, which will receive an Error (if applicable) and an
 *   ObjectStorage instance.
 */
function newFromIdentity(identity, region) {
  var service = identity.serviceByName('object-store', region);
  var endpoint = service.publicURL;
  var os = new ObjectStorage(identity.token(), endpoint);

  return os;
}

/**
 * Given an authentication token and an endpoint, create an
 * ObjectStorage instance.
 *
 * @param {string} authToken
 *   An authentication token. These typically are supplied by Identity
 *   Services.
 * @param {string} endpoint
 *   An endpoint base URL.
 */
function ObjectStorage(authToken, endpoint) {
  this.token = authToken;
  this.endpoint = endpoint;
}

/**
 * Get the token.
 *
 * @return {string}
 *   The auth token.
 */
ObjectStorage.prototype.token = function () {
  return this.token;
}
/**
 * Get the endpoint URL.
 *
 * @param {string}
 *  The URL endpoint.
 */
ObjectStorage.prototype.url = function () {
  return this.endpoint;
}

ObjectStorage.prototype.useCDN = function (cdn) {}
ObjectStorage.prototype.hasCDN = function (name) {}
ObjectStorage.prototype.cdnUrl = function (name, useSSL) {}


/**
 * Create a new container.
 *
 * @param {string} name
 *   The name of the container.
 * @param {ACL} acl
 *   An access control list.
 * @param {object} metadata
 *   An object of name/value metadata pairs.
 */
ObjectStorage.prototype.createContainer = function (name, acl, metadata) {

  var url = this.endpoint + '/' + encodeURI(name);
  var opts = URL.parse(url);
  opts.method = 'PUT';
  opts.headers = {
    'X-Auth-Token': this.token
  };

  ObjectStorage.encodeMetadata(metadata, opts.headers);


  
}

ObjectStorage.prototype.containers = function (limit, marker) {
  var url = this.url . '/containers';
}
ObjectStorage.prototype.container = function (name) {}
ObjectStorage.prototype.hasContainer = function (name) {}
ObjectStorage.prototype.updateContainer = function (name, acl, metadata) {}
ObjectStorage.prototype.changeContainerACL = function (containerName, acl) {}
ObjectStorage.prototype.deleteContainer = function (containerName) {}
ObjectStorage.prototype.accountInfo = function () {}

ObjectStorage.encodeMetadata = function (metadata, headers) {
  if (!headers) {
    headers = {};
  }

  var format = "X-Object-Meta-%s";
  for (var name in metadata) {
    var newName = Util.format(format, name);
    headers[newName] = metadata[name];
  }
  return headers;
}
