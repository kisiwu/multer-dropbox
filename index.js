/** TYPE DEF */
/**
 * [FilesCommitInfo](http://dropbox.github.io/dropbox-sdk-js/global.html#FilesCommitInfo) with property "contents" being optional.
 * 
 * - **path** -	Path in the user's Dropbox to save the file.
 * - **contents** - The file contents to be uploaded.
 * - **mode** -	[FilesWriteMode](http://dropbox.github.io/dropbox-sdk-js/global.html#FilesWriteMode) - Selects what to do if the file already exists.
 * - **autorename** -	If there's a conflict, as determined by mode, have the Dropbox server try to autorename the file to avoid conflict.
 * - **client_modified** - [Timestamp](http://dropbox.github.io/dropbox-sdk-js/global.html#Timestamp) - The value to store as the client_modified timestamp. Dropbox automatically records the time at which the file was written to the Dropbox servers. It can also record an additional timestamp, provided by Dropbox desktop clients, mobile clients, and API apps of when the file was actually created or modified.
 * - **mute** -	Normally, users are made aware of any file modifications in their Dropbox account via notifications in the client software. If true, this tells the clients that this modification shouldn't result in a user notification.
 * - **property_groups** - Array.<[FilePropertiesPropertyGroup](http://dropbox.github.io/dropbox-sdk-js/global.html#FilePropertiesPropertyGroup)> - List of custom properties to add to file.
 * - **strict_conflict** - Be more strict about how each WriteMode detects conflict. For example, always return a conflict error when mode = WriteMode.update and the given "rev" doesn't match the existing file's "rev", even if the existing file has been deleted.
 * @typedef {Object} FilesCommitInfo
 * @property {string} path Path in the user's Dropbox to save the file.
 * @property {object} [contents] The file contents to be uploaded.
 * @property {Object} [mode] FilesWriteMode
 * @property {boolean} [autorename]
 * @property {Object} [client_modified] Timestamp
 * @property {boolean} [mute]
 * @property {Array} [property_groups] Array.<FilePropertiesPropertyGroup>
 * @property {boolean} [strict_conflict]
 */
/** */

const Log = require('@novice1/logger').debugger('multer:dropbox')
const { DropboxBase } = require('dropbox')
const parallel = require('run-parallel')

const METHODS = [
  'path',
  'contents',
  'mode',
  'autorename',
  'client_modified',
  'mute',
  'property_groups',
  'strict_conflict'
];

function staticValue (value) {
  return function (req, file, cb) {
    cb(null, value)
  }
}

/**
 * @param {Function|DropboxBase} client [Dropbox](https://www.npmjs.com/package/dropbox#quickstart) client
 * @param {object} opts
    Object with the following properties:
    - filesCommitInfo: [FilesCommitInfo](http://dropbox.github.io/dropbox-sdk-js/global.html#FilesCommitInfo) or a function that sends it ("contents" being optional).
 * @param {Function|FilesCommitInfo} [opts.filesCommitInfo] [FilesCommitInfo](http://dropbox.github.io/dropbox-sdk-js/global.html#FilesCommitInfo) or a function that sends it ("contents" being optional).
 * @param {Function|string} [opts.path]
 * @param {Function|Object} [opts.contents]
 * @param {Function|Object} [opts.mode]
 * @param {Function|boolean} [opts.autorename]
 * @param {Function|Object} [opts.client_modified]
 * @param {Function|boolean} [opts.mute]
 * @param {Function|Array} [opts.property_groups]
 * @param {Function|boolean} [opts.strict_conflict]
 */
function DropboxStorage (client, opts) {
  this.client = typeof client == 'function' ? client : staticValue(client);

  METHODS.forEach(method => {
    this[method] = typeof opts[method] == 'function' ? opts[method] : staticValue(opts[method]);
  });

  this.filesCommitInfo = typeof opts.filesCommitInfo == 'function' ? opts.filesCommitInfo : staticValue(opts.filesCommitInfo);
}

DropboxStorage.prototype.getFilesCommitInfo = function (req, file, cb) {
  const storage = this;
  const tasks = [];

  METHODS.forEach(
    method => {
      tasks.push(storage[method].bind(storage, req, file))
    }
  );

  parallel(tasks,
  (err, results) => {
    if(err) return cb(err)

    storage.filesCommitInfo(req, file, (err2, replacements) => {
      if(err2) return cb(err2)

      let filesCommitInfo = {};

      METHODS.forEach((m, i) => {
        if(typeof results[i] != 'undefined') {
          filesCommitInfo[m] = results[i]
        }
      })
      
      if (replacements && typeof replacements == 'object') {
        Object.assign(filesCommitInfo, replacements)
      }

      cb(null, filesCommitInfo)
    })
  })
}

DropboxStorage.prototype._handleFile = function (req, file, cb) {
  const storage = this;

  this.getFilesCommitInfo(req, file, function (err, filesCommitInfo) {
    if (err) return cb(err)

    if (filesCommitInfo && !filesCommitInfo.contents) {
      filesCommitInfo.contents = file.stream;
    }

    storage.client(req, file, function (err2, client) {
      if (err2) return cb(err2)

      client.filesUpload(filesCommitInfo).then(
        f => cb(null, f),
        err => {
          Log.error(err);
          cb(err);
        }
      );
    });
  });
}

DropboxStorage.prototype._removeFile = function (req, file, cb) {
  this.client(req, file, function (err, client) {
    if (err) return cb(err)

    client.filesDeleteV2({path: file.result.path_display}).then(
      r => cb(null, r),
      err => {
        Log.error(err);
        cb(err);
      }
    );
  });
}

/**
 * 
 * @param {Function|DropboxBase} client [Dropbox](https://www.npmjs.com/package/dropbox#quickstart) client
 * @param {object} opts
    Object with the following properties:
    - filesCommitInfo: [FilesCommitInfo](http://dropbox.github.io/dropbox-sdk-js/global.html#FilesCommitInfo) or a function that sends it ("contents" being optional).
 * @param {Function|FilesCommitInfo} [opts.filesCommitInfo] [FilesCommitInfo](http://dropbox.github.io/dropbox-sdk-js/global.html#FilesCommitInfo) or a function that sends it ("contents" being optional).
 * @param {Function|string} [opts.path]
 * @param {Function|Object} [opts.contents]
 * @param {Function|Object} [opts.mode]
 * @param {Function|boolean} [opts.autorename]
 * @param {Function|Object} [opts.client_modified]
 * @param {Function|boolean} [opts.mute]
 * @param {Function|Array} [opts.property_groups]
 * @param {Function|boolean} [opts.strict_conflict]
 */
function multerStorage (client, opts) {
  return new DropboxStorage(client, opts)
}

module.exports = multerStorage;