/**
 * Information about an object.
 */
module.exports = ObjectInfo;

/**
 * Build a new ObjectInfo instance from JSON data.
 *
 * This represents the data structure returned from a container
 * listing operation.
 */
function ObjectInfo(obj, token, url) {
  this.data = obj;
  this._token = token;
  this._url = url + '/' + encodeURI(obj.name);

}

ObjectInfo.newFromResponse = function (name, response, token, url) {
  var headers = response.headers;
  var metadata = ObjectInfo.decodeMetadata(headers);
  var data = {
    name: name,
    content_type: headers['content-type'],
    bytes: headers['content-length'],
    hash: headers['etag'],
    last_modified: headers['last-modified'],
    content_disposition: headers['content-disposition'],
    transfer_encoding: headers['transfer-encoding'],
    metadata: metadata,
    hasMetadata: true
  };

  return new ObjectInfo(data, token, url);
}

ObjectInfo.decodeMetadata = function (metadata) {
  return {};
}

ObjectInfo.prototype.name = function () {
  return this.data.name;
}
ObjectInfo.prototype.contentLength = function () {
  return this.data.bytes;
}
ObjectInfo.prototype.eTag = function () {
  return this.data.hash;
}
ObjectInfo.prototype.contentType = function () {
  return this.data.content_type;
}
ObjectInfo.prototype.lastModified = function () {
  return this.data.last_modified;
}
ObjectInfo.prototype.encoding = function () {
  return this.data.transfer_encoding;
}
ObjectInfo.prototype.disposition = function () {
  return this.data.content_disposition;
}
ObjectInfo.prototype.metadata = function () {
  if (this.data.hasMetadata) {
    return this.data.metadata;
  }
}

/**
 * Get the actual object.
 */
ObjectInfo.prototype.object = function () {
}
