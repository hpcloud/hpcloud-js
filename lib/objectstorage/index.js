exports.version = "0.1.0";

var Container = require('./container');

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
 * When this is successful, the callback function will receive a
 * Container object. This object will have a flag (container.isNew)
 * indicating whether this container was just created (true) or whether
 * it existed prior to this call (false).
 *
 * Attempting to create an already existing container will NOT result in
 * an error. It will simply result in container.isNew being set to false.
 *
 * @param {string} name
 *   The name of the container.
 * @param {ACL} acl
 *   An access control list. If ACL is not set, the default ACL will be
 *   private.
 * @param {object} metadata
 *   An object of name/value metadata pairs.
 * @param {Function} fn
 *   The callback, which will be executed as fn(Error, Container). Error
 *   will only be set if an error is encountered. Otherwise, a Container
 *   object will be returned.
 */
ObjectStorage.prototype.createContainer = function (name, acl, metadata, fn) {

  if (!acl) {
    acl = new ACL();
  }

  var url = this.endpoint + '/' + encodeURI(name);
  var opts = URL.parse(url);
  opts.method = 'PUT';
  opts.headers = {
    'X-Auth-Token': this.token
  };

  // Encode the metadata as container metadata.
  ObjectStorage.encodeContainerMetadata(metadata, opts.headers);

  // Do the request.
  Transport.doRequest(opts, null, function (error, response, data) {
    if (error) {
      fn(error);
      return;
    }

    var container = new Container(name, url);
    container.isNew = response.statusCode == 201;

    fn(false, container);
  });
  
}
/**
 * Delete a container from the remote object storage.
 *
 * This will destroy the container and all of its contents.
 *
 * @param {String} name
 *   The name of the container.
 * @param {Function} fn
 *   The callback to be executed when the operation is complete. This
 *   will be executed as fn(Error, Boolean), where the boolean will be
 *   set to 'true' if the container was successfully deleted.
 */
ObjectStorage.prototype.deleteContainer = function (containerName, fn) {
  var url = this.endpoint + '/' + encodeURI(containerName);
  var opts = URL.parse(url);
  opts.method = 'DELETE';
  opts.headers = {
    'X-Auth-Token': this.token
  };

  Transport.doRequest(opts, null, function (error, response, data) {
    if (error) {
      fn(error, false);
      return;
    }

    var deleted = response.statusCode == 204;
    fn (false, deleted);
    return;
  });
}

ObjectStorage.prototype.containers = function (limit, marker) {
  var url = this.url + '/containers';
}
ObjectStorage.prototype.container = function (name) {}
ObjectStorage.prototype.hasContainer = function (name) {}
ObjectStorage.prototype.updateContainer = function (name, acl, metadata) {}
ObjectStorage.prototype.changeContainerACL = function (containerName, acl) {}
ObjectStorage.prototype.accountInfo = function () {}

ObjectStorage.encodeContainerMetadata = function (metadata, headers) {
  if (!headers) {
    headers = {};
  }

  var format = "X-Container-Meta-%s";
  for (var name in metadata) {
    var newName = Util.format(format, name);
    headers[newName] = metadata[name];
  }
  return headers;
}
