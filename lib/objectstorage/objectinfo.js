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
 * Information about an object.
 */
module.exports = ObjectInfo;

/**
 * Build a new ObjectInfo instance.
 *
 * This represents the data about an object. It is used under the
 * following circumstances:
 *
 * - SAVING: When creating a new object, you declare the object as
 *   ObjectInfo. When saving, you will save with an ObjectInfo and a Stream
 *   of data. See Container.save().
 * - LISTING: When calling Container.objects(), a list including ObjectInfo
 *   items will be returned.
 * - FETCHING METADATA: Using Container.objectInfo(), you can get just the
 *   info about an object, without downloading the entire object.
 * - FETCHING OBJECT: When you fetch the entire object, you will also get
 *   the ObjectInfo. See RemoteObject.info().
 * - UPATING METADATA: When updating just the metadata on an object, you
 *   will supply an ObjectInfo object.
 *
 * @class ObjectInfo
 * @constructor
 * @param {String} name The name of the object.
 * @param {String} [contentType] (Optional) The type of content, defaults to Application/X-Octet-Stream.
 */
function ObjectInfo(name, contentType) {
  this._name = name;
  this._type = contentType || ObjectInfo.DEFAULT_CONTENT_TYPE;
  this._partial = false;
}

/**
 * The default content type.
 * @property DEFAULT_CONTENT_TYPE
 * @type String
 */
ObjectInfo.DEFAULT_CONTENT_TYPE = 'application/x-octet-stream';

/**
 * Create a new ObjectInfo instance from JSON data.
 *
 * @method newFromJSON
 * @static
 * @param {Object} An object from a JSON response.
 * @return {ObjectInfo} A new ObjectInfo object.
 */
ObjectInfo.newFromJSON = function (obj) {
  var info = new ObjectInfo(obj.name);

  // JSON doesn't have all the fields.
  info._partial = true;

  info.setETag(obj.hash);
  info.setContentType(obj.content_type);
  info.setContentLength(obj.bytes);
  info.setLastModified(obj.last_modified);

  // These can't be gleaned from the JSOM, which
  // is why this is _partial.
  //info.setMetadata();
  // info.setTransferEncoding();
  // info.setDisposition();

  return info;
};

/**
 * Create a new ObjectInfo from an HTTP Client Response.
 *
 * @method newFromResponse
 * @static
 * @param {String} name The name of an object
 * @param {Object} A HTTP response for an object.
 * @return {ObjectInfo} A new ObjectInfo object.
 */
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

  var info = new ObjectInfo(name);
  info.setETag(headers['etag']);
  info.setContentType(headers['content-type']);
  info.setContentLength(headers['content-length']);
  info.setTransferEncoding(headers['transfer-encoding']);
  info.setDisposition(headers['content-disposition']);
  info.setMetadata(metadata);
  info.setLastModified(headers['last-modified']);

  return info;
};


/**
 * Fetch the metadata from the headers and return them.
 *
 * This does not decode the value, since we do not know anyting about the
 * value's encoding.
 *
 * @method decodeMetadata
 * @static
 * @param {Object} headers The raw headers.
 * @return {Object} The metadata name/value pairs.
 */
ObjectInfo.decodeMetadata = function (headers) {
  var metadata = {};
  for (var header in headers) {
    var index = header.indexOf('x-object-meta-');
    if (index == 0) {
      var name = decodeURIComponent(header.substring(14));
      var val = headers[header];
      metadata[name] = val;
    }
  }

  return metadata;
};

// ==================================================================
// Mutators
// ==================================================================

/**
 * Set the new name of this object.
 *
 * Note that this only changes the local copy of the object. An object
 * must be saved before the server copy is changed.
 *
 * @method setName
 * @chainable
 * @param {String} name The new name.
 * @return {ObjectInfo} this
 */
ObjectInfo.prototype.setName = function (name) {
  this._name = name;
  return this;
};

/**
 * Set the metadata for this object.
 *
 * @method setMetadata
 * @chainable
 * @param {Object} metadata Name/value pairs to be added as metadata.
 * @return {ObjectInfo} this
 */
ObjectInfo.prototype.setMetadata = function (metadata) {
  this._metadata = metadata;
  return this;
};

/**
 * Add a name/value pair to the metadata.
 *
 * If this entry exists already, it will be overwritten.
 *
 * @method addMetadatum
 * @param {String} name The name.
 * @param {String} value The value.
 */
ObjectInfo.prototype.addMetadatum = function (name, value) {
  this._metadata[name] = value;
};

/**
 * Remove a key/value pair from the metadata.
 *
 * This will remove a named item if it exists.
 *
 * @method deleteMetadatum
 * @param {String} name The metadatum name.
 */
ObjectInfo.prototype.deleteMetadatum = function (name) {
  delete this._metadata[name];
};

/**
 * Check whether a value exists.
 *
 * NULL is treated as false.
 *
 * @method hasMetadatum
 * @param {String} name The name to search for.
 */
ObjectInfo.prototype.hasMetadatum = function (name) {
  var k = this._metadata[name];
  return k != undefined && k != null;
};

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
 * @method setContentType
 * @chainable
 * @param {String} contentType The content type.
 * @return {ObjectInfo} this
 */
ObjectInfo.prototype.setContentType = function (contentType) {
  this._type = contentType;
  return this;
};

/**
 * Set the ETag value
 *
 * @method setETag
 * @chainable
 * @param {String} md5 md5 hash for the etag.
 * @return {ObjectInfo} this
 */
ObjectInfo.prototype.setETag = function (md5) {
  this._etag = md5;
  return this;
};

/**
 * Set the content length for the object.
 *
 * @method setContentLength
 * @chainable
 * @param {Number} bytes Number of bytes of the object content.
 * @return {ObjectInfo} this
 */
ObjectInfo.prototype.setContentLength = function (bytes) {
  this.length = bytes;
  return this;
};

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
 * @method setTransferEncoding
 * @chainable
 * @param {String} encoding The encoding.
 * @return {ObjectInfo} this
 */
ObjectInfo.prototype.setTransferEncoding = function (encoding) {
  this._encoding = encoding;
  return this;
};

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
 * @method setDisposition
 * @chainable
 * @param {String} disposition The content disposition.
 * @return {ObjectInfo} this
 */
ObjectInfo.prototype.setDisposition = function (disposition) {
  this._disposition = disposition;
  return this;
};

/**
 * EXPERT: Set additional headers.
 *
 * Set additional HTTP headers for Swift. Note, this is not to add to the
 * additional headers but to set them replacing any that already exist.
 *
 * @method setAdditionalHeaders
 * @chainable
 * @param {Object} headers This is a headers object.
 * @return {ObjectInfo} this
 */
ObjectInfo.prototype.setAdditionalHeaders = function (headers) {
  this._headers = headers;
  return this;
};

/**
 * Set the last modified date
 *
 * @method setLastModified
 * @chainable
 * @param {String} lastmod The date and time the object was last modified.
 * @return {ObjectInfo} this
 */
ObjectInfo.prototype.setLastModified = function (lastmod) {
  this._modified = lastmod;
  return this;
};

/**
 * EXPERT: Remove headers from the additional header field.
 *
 * @method removeHeaders
 * @param {Array} list A list of header keys to remove from the object headers.
 */
ObjectInfo.prototype.removeHeaders = function (list) {
  if (this._headers == undefined) {
    return;
  }
  for (var i; i < list.length; ++i) {
    // XXX: There should be a better way to do this.
    if (this._headers[list[i]]) {
      this._headers[list[i]] = undefined;
    }
  }
};

// ==================================================================
// Accessors
// ==================================================================

/**
 * Get the objects name.
 *
 * @method name
 * @return {string} The name of the object.
 */
ObjectInfo.prototype.name = function () {
  return this._name;
};

/**
 * Get the etag of the object
 *
 * @method eTag
 * @return {String} The etag of the object. This is a md5 hash.
 */
ObjectInfo.prototype.eTag = function () {
  return this._etag;
};

/**
 * Get the content length of the object
 *
 * @method contentLength
 * @return {Number} The length of the content in bytes.
 */
ObjectInfo.prototype.contentLength = function () {
  return this.length;
};

/**
 * Get the content type of the current object.
 *
 * @method contentType
 * @return {String} The type of content in the object.
 */
ObjectInfo.prototype.contentType = function () {
  return this._type;
};

/**
 * Get the object's trasport encoding.
 * 
 * Throws Error When the results are partial, and error is thrown.
 * 
 * @method transferEncoding
 * @return {String} The transfer encoding.
 */
ObjectInfo.prototype.transferEncoding = function () {
  if (this._partial && this._encoding == undefined) {
    throw new Error('Results are partial. Transfer encoding is not available.');
  }
  return this._encoding;
};

/**
 * The last modified date
 *
 * @method lastModified
 * @return {String} The last modified date.
 */
ObjectInfo.prototype.lastModified = function () {
  return this._modified;
};

/**
 * Get the object's disposition.
 * 
 * Throws Error When the results are partial, and error is thrown.
 *
 * @method disposition
 * @return {String} The content disposition.
 */
ObjectInfo.prototype.disposition = function () {
  if (this._partial && this._disposition== undefined) {
    throw new Error('Results are partial. Disposition is not available.');
  }
  return this._disposition;
};

/**
 * Get metadata.
 *
 * This will only be available if ObjectInfo.is
 *
 * Throws Error When the results are partial, and error is thrown.
 *
 * @method metadata
 * @returns {Object} An object containting names/values of metadata.
 */
ObjectInfo.prototype.metadata = function () {
  if (this._partial && this._metadata == undefined) {
    throw new Error('Results are partial. Metadata is not available.');
  }
  return this._metadata;
};

/**
 * EXPERT: Get any additional headers.
 *
 * @method additionalHeaders
 * @return {Object} Additional headers
 */
ObjectInfo.prototype.additionalHeaders = function () {
  return this._headers;
};

/**
 * Merge metadata into a supplied headers object.
 *
 * Headers are modified in place.
 *
 * @method mergeMetadataHeaders
 * @param {Object} headers The existing headers.
 */
ObjectInfo.prototype.mergeMetadataHeaders = function (headers) {
  // Make sure there is no case where this is not set when it
  // should be.
  if (!this._metadata) {
    return;
  }

  for (var m in this._metadata) {
    var mheader = 'X-Object-Meta-' + encodeURIComponent(m);
    headers[mheader] = this._metadata[m];
  }

};

/**
 * Merge additional headers into a supplied headers object.
 *
 * Headers are modified in place.
 *
 * @method mergeAdditionalHeaders
 * @param {Object} headers The existing headers.
 */
ObjectInfo.prototype.mergeAdditionalHeaders = function (headers) {
  if (!this._headers) {
    return;
  }

  for (var h in this._headers) {
    headers[h] = this._headers[h]
  }
};
