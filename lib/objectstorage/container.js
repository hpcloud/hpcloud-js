/**
 * A container holds numerous objects. A single object storage instance
 * may have an indefinite number of containers, and each container may
 * have an indefinite number of objects. However, containers may not
 * have subcontainers.
 *
 * A container is not a directory. It is closer (to use a file system
 * analogy) to a file system volume.
 */

var Util = require('util');
var URL = require('url');
var Transport = require('../transport');
var ACL = require('./acl');


module.exports = Container;

/**
 * Create a new container.
 *
 * When a new container is created, no check is done against the server
 * to ensure that the container exists. Thus, it is possible to have a
 * local container object that does not point to a legitimate
 * server-side container.
 *
 * @param {String} name
 *   The name of the container.
 * @param {String} token
 *   An authentication token.
 * @param {String} url
 *   The URL of the container.
 */
function Container(name, token, url) {
  this._name = name;
  this._url = url;
  this._token = token;
  this.isNew = false;
}

/**
 * Construct a new Container from a response.
 *
 * Internally, this is used to build a new container from HTTP headers.
 *
 * @param {String} name
 *   The name of the container.
 * @param {HTTPResponse} response
 *   An HTTP response object.
 * @param {String} token
 *   An authentication token.
 * @param {String} endpoint
 *   The URL to the Swift REST endpoint. This is used as the base URL to
 *   construct a URL to the container itself.
 * @return {Container}
 *   A container object.
 */
Container.newFromResponse = function (name, response, token, endpoint) {
  var url = endpoint + '/' + encodeURI(name);
  var container = new Container(name, token, url);
  var headers = response.headers;

  container._bytes = headers['x-container-bytes-used'];
  container._count = headers['x-container-object-count'];
  container._baseUrl = endpoint;

  var metadata = Container.decodeMetadata(headers);
  container.setMetadata(metadata);

  this._acl = ACL.newFromHeaders(headers);

  return container;
}

/**
 * Create a new Container from JSON data.
 *
 * This is used to create a new container object from a JSON response.
 *
 * @param {Object} json
 a*   JSON data in the correct format.
 * @param {String} token
 *   The auth token.
 * @param {String} url
 *   The URL to object storage. This will be modified internally to 
 *   point to this container.
 * @return {Container}
 *   A container object.
 */
Container.newFromJSON = function (json, token, url) {
  var fullUrl = url + '/' + encodeURI(json.name);
  var container = new Container(json.name, token, fullUrl);
  container._baseUrl = url;
  container._count = json.count || 0;
  container._bytes = json.bytes || 0;

  return container;
}

/**
 * Get the name of this container.
 *
 * @return {String}
 *   The container name.
 */
Container.prototype.name = function() {
  return this._name;
}

Container.prototype.token = function () {
  return this._token;
}
Container.prototype.url = function () {
  return this._url;
}

/**
 * Get the byte count for this container.
 *
 * Retrieves the number of bytes this container currently
 * consumes.
 *
 * @return {int}
 *   The byte count.
 */
Container.prototype.bytes = function () {
  return this._bytes || 0;
}
/**
 * Get the number of objects in the container.
 *
 * This returns the count of objects currently inside of the container.
 * This is the total number of objects, not the number of objects at the
 * "top level" of the container.
 *
 * @return {int}
 *   The number of items in the container.
 */
Container.prototype.count = function () {
  return this._count || 0;
}

Container.prototype.useCDN = function () {
  throw new Error('useCDN not implemented.');
}

/**
 * Get the metadata for a container.
 *
 * Depending on how the container was constructed, this may require a
 * trip to the remote server to fetch metadata.
 *
 * @param {Function} fn
 *   The callback, which will receive two parameters:
 *   fn(Error e, Object metadata).
 */
Container.prototype.metadata = function (fn) {
  if (this._metadata == undefined) {
    this.fetchDetails(this, function (e, container) {
      // container is actually the outer object.
      fn(e, container._metadata);
    });
  }
  else {
    fn(false, this._metadata);
  }
}
/**
 * Set the metadata on the present object.
 *
 * This does NOT save the metadata on the remote server.
 *
 * @param {Object} metadata
 *   Name/value pairs for metadata. It is recommended that you encode the values
 *   prior to putting them here, as the Swift REST docs make no assumptions about
 *   how the metadata is encoded or decoded.
 */
Container.prototype.setMetadata = function (metadata) {
  this._metadata = metadata;
}

/**
 * Update the metadata on an object.
 *
 * This allows you to update an object's metadata without
 * requiring you to re-post the object's data payload.
 *
 * @param {RemoteObject} obj
 *   The local copy of the object that should be updated on the remote server.
 * @param {Function} fn
 *   The callback.
 */
Container.prototype.updateObjectMetadata = function (obj, fn) {
}
Container.prototype.save = function () {
}
Container.prototype.copy = function () {
}
Container.prototype.object = function () {
}
Container.prototype.proxyObject = function () {
}
Container.prototype.remoteObject = function () {
}
Container.prototype.objects = function () {
}
Container.prototype.objectsWithPrefix = function () {
}
Container.prototype.objectsByPath = function () {
}
/**
 * Get the URL of this container.
 *
 * @return {String}
 *   The URL pointing to this container.
 */
Container.prototype.url = function () {
  return this._url;
}
Container.prototype.cdnUrl = function () {
  throw new Error('Not implemented.');
}
/**
 * Get the ACL for the current container.
 *
 * In some cases, this will result in a request to the
 * remote server.
 *
 * @param {Function} fn
 *   The callback, which will receive fn(Error e, ACL acl);
 */
Container.prototype.acl = function (fn) {
  if (this._acl== undefined) {
    this.fetchDetails(this, function (e, container) {
      // container is actually the outer object.
      fn(e, container._acl);
    });
  }
  else {
    fn(false, this._acl);
  }
}
Container.prototype.delete = function () {
}

/**
 * fn(Error, Container);
 */
Container.prototype.fetchDetails = function (container, fn) {
  var url = container.url();
  var token = container.token();
  // Need a check here.
  var opts = URL.parse(url);
  opts.method = 'GET';
  opts.headers = {
    'X-Auth-Token': token
  }
  Transport.doRequest(opts, function (e, response) {
    if (e) {
      fn(e);
      return;
    }
    var headers = response.headers;

    container._bytes = headers['x-container-bytes-used'];
    container._count = headers['x-container-object-count'];

    container._acl = ACL.newFromHeaders(headers);

    var metadata = Container.decodeMetadata(headers);
    container.setMetadata(metadata);
    fn(false, container);
  });

};


Container.encodeMetadata = function (metadata, headers) {
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

Container.decodeMetadata = function (headers) {
  var metadata = {};
  var prefix = 'x-container-meta-';
  var plen = prefix.length;
  for (header in headers) {
    if (header.indexOf(prefix) == 0) {
      metadata[header.substring(plen)] = headers[header];
    }
  }
  return metadata;
}
