/**
 * A new local object that has not yet been stored.
 *
 * Use this to create new objects.
 */

module.exports = LocalObject;

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

/**
 * Set the content for this object.
 *
 * This sets the content for this object. Optionally, set the content type at the same time.
 *
 * @param {ReadableStream} stream
 *   Any readable stream.
 * @param {String} contentType (Optional)
 *   A content type.
 */
LocalObject.prototype.setContent = function (stream, contentType) {
  if (contentType != undefined) {
    this.setContentType(contentType);
  }

  // TODO: Should this accept Buffer and String objects as well?

  this._content = stream;
}
// ==================================================================
// Accessors
// ==================================================================

/* Not sure how to do these. They can incur severe performance penalties
 * if called on a stream.
LocalObject.prototype.eTag = function () {
}
LocalObject.prototype.contentLength = function () {
}
*/
LocalObject.prototype.content = function () {
  return this._content;
}
/**
 * Get the name of the object.
 *
 * @return {String}
 *   The name of the object.
 */
LocalObject.prototype.name = function () {
  return this._name;
}
/**
 * Get the content type of the current object.
 */
LocalObject.prototype.contentType = function () {
  return this._type;
}
/**
 * Get the object's trasport encoding.
 */
LocalObject.prototype.encoding = function () {
  return this._encoding;
}
/**
 * Get the object's disposition.
 */
LocalObject.prototype.disposition = function () {
  return this._disposition;
}
/**
 * EXPERT: Get any additional headers.
 */
LocalObject.prototype.additionalHeaders = function () {
  return this._headers;
}

/**
 * Merge metadata into a supplied headers object.
 *
 * Headers are modified in place.
 *
 * @param {Object} headers
 *   The existing headers.
 */
LocalObject.prototype.mergeMetadataHeaders = function (headers) {
  // Make sure there is no case where this is not set when it
  // should be. Probably would only happen for ProxyObject.
  if (!this._metadata) {
    return;
  }

  for (var m in this._metadata) {
    var mheader = 'X-Object-Meta-' + encodeURIComponent(m);
    headers[mheader] = this._metadata[m];
  }

}

/**
 * Merge additional headers into a supplied headers object.
 *
 * Headers are modified in place.
 *
 * @param {Object} headers
 *   The existing headers.
 */
LocalObject.prototype.mergeAdditionalHeaders = function (headers) {
  if (!this._headers) {
    return;
  }

  for (var h in this._headers) {
    headers[h] = this._headers[h]
  }
}


