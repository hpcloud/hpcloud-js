/**
 * A container holds numerous objects. A single object storage instance
 * may have an indefinite number of containers, and each container may
 * have an indefinite number of objects. However, containers may not
 * have subcontainers.
 *
 * A container is not a directory. It is closer (to use a file system
 * analogy) to a file system volume.
 */


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
 * @param {String} url
 *   The URL of the container.
 */
function Container(name, url) {
  this._name = name;
  this._url = url;
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
  var container = new Container(name, url);
  var headers = response.headers;

  container._bytes = headers['x-container-bytes-used'];
  container._count = headers['x-container-object-count'];
  container._baseUrl = endpoint;
  container._token = token;

  return container;
}

/**
 * Create a new Container from JSON data.
 *
 * This is used to create a new container object from a JSON response.
 *
 * @param {Object} json
 *   JSON data in the correct format.
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
  var container = new Container(json.name, fullUrl);
  container._baseUrl = url;
  container._token = token;
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
}
Container.prototype.metadata = function () {
}
Container.prototype.setMetadata = function () {
}
Container.prototype.updateMetadata = function () {
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
}
Container.prototype.acl = function () {
}
Container.prototype.delete = function () {
}
