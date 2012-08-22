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
  this.name = name;
  this.url = url;
  this.isNew = false;
}

/**
 * Construct a new Container from a response.
 */
Container.newFromResponse = function (name, response, data, token, endpoint) {
  return new Container(name, endpoint);
}

