/**
 * A new local object that has not yet been stored.
 *
 * Use this to create new objects.
 */

modules.export = LocalObject;

function LocalObject(name, contentType) {
  this._name = name;
  this._type = contentType || LocalObject.DEFAULT_CONTENT_TYPE;
}

LocalObject.DEFAULT_CONTENT_TYPE = 'application/x-octet-stream';

// ==================================================================
// Mutators
// ==================================================================

/**
 * Set the new name of this object.
 *
 * Note that this only changes the local copy of the object. An object
 * must be saved before the server copy is changed.
 *
 * @param {String} name
 *   The new name.
 */
LocalObject.prototype.setName = function (name) {
  this._name = name;
}
/**
 * Set the metadata for this object.
 *
 * @param {Object} metadata
 *   Name/value pairs to be added as metadata.
 */
LocalObject.prototype.setMetadata = function (metadata) {
  this._metadata = metadata;
}
/**
 * Set the content type (MIME type) of the object.
 *
 * The default type is `application/x=octet-stream'. You may
 * also add encoding information, such as `text/html; charset=iso-8859-13`.
 * In fact, any options HTTP allows, you can add.
 *
 * Content type is neither parsed nor verified before being sent to the remote
 * object storage.
 *
 * @param {String} contentType
 *   The content type.
 */
LocalObject.prototype.setContentType = function (contentType) {
  this._type = contentType;
}
/**
 * Set the transfer encoding.
 *
 * NOTE: This is informational, and will not cause any processing. If you
 * mark an object as gzipped, it is up to you to do the gzipping.
 *
 * This allows you to save, say, a compressed copy of a file and tell
 * Object Storage that the file is of type foo/bar, but is encoded
 * with gzip.
 *
 * Common encoding types:
 * - gzip
 * - zip
 * - compress
 *
 * Since object storage does not attempt to decode objects, you can use
 * any value your system supports.
 *
 * @param {String} encoding
 *   The encoding.
 */
LocalObject.prototype.setEncoding = function (encoding) {
  this._encoding = encoding;
}
/**
 * Set the content disposition.
 *
 * Commonly, this is used to force a user agent to prompt for download instead of
 * attempting to display.
 *
 * Example: `o->setDisposition('attachment; filename=foo.png')`
 *
 * When a disposition is submitted, it will be returned in the object headers
 * upon GET request.
 *
 * @param {String} disposition
 *   The content disposition.
 */
LocalObject.prototype.setDisposition = function (disposition) {
  this._disposition = disposition;
}
/**
 * EXPERT: Set additional headers.
 *
 * Set additional HTTP headers for Swift.
 */
LocalObject.prototype.setAdditionalHeaders = function (headers) {
  this._headers = headers;
}
/**
 * EXPERT: Remove headers from the additional header field.
 */
LocalObject.prototype.removeHeaders = function (list) {
  if (this._headers == undefined) {
    return;
  }
  for (var i; i < list.length; ++i) {
    // XXX: There should be a better way to do this.
    if (this._headers[list[i]]) {
      this._headers[list[i]] = undefined;
    }
  }
}

LocalObject.prototype.setContent = function () {
}
// ==================================================================
// Accessors
// ==================================================================

LocalObject.prototype.eTag = function () {
}
LocalObject.prototype.contentLength = function () {
}
LocalObject.prototype.name = function () {
}
LocalObject.prototype.content = function () {
}
LocalObject.prototype.contentType = function () {
}
LocalObject.prototype.encoding = function () {
}
LocalObject.prototype.disposition = function () {
}
LocalObject.prototype.additionalHeaders = function () {
}


