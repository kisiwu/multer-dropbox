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

/**
 * @typedef {(req: Express.Request, file: Express.Multer.File, cb: ((error?: any, value?: T) => void)) => void} MulterDropboxValueFunction<T>
 * @template T
 * @param {T} value The static value to be returned by the function.
 */

/**
 * @typedef {Object} CommitInfo
 * @property {MulterDropboxValueFunction<FilesCommitInfo>|FilesCommitInfo} [filesCommitInfo] [FilesCommitInfo](http://dropbox.github.io/dropbox-sdk-js/global.html#FilesCommitInfo) or a function that sends it ("contents" being optional).
 * @property {MulterDropboxValueFunction<string>|string} [path]
 * @property {MulterDropboxValueFunction<Object>|Object} [contents]
 * @property {MulterDropboxValueFunction<Object>|Object} [mode]
 * @property {MulterDropboxValueFunction<boolean>|boolean} [autorename]
 * @property {MulterDropboxValueFunction<Object>|Object} [client_modified]
 * @property {MulterDropboxValueFunction<boolean>|boolean} [mute]
 * @property {MulterDropboxValueFunction<Array>|Array} [property_groups]
 * @property {MulterDropboxValueFunction<boolean>|boolean} [strict_conflict]
 */
/** */

import parallel from 'run-parallel'

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

/**
 * @template T
 * @param {T} value 
 * @returns {MulterDropboxValueFunction<T>}
 */
function staticValue(value) {
  return function (req, file, cb) {
    cb(null, value)
  }
}




class DropboxStorage {
  /**
    * @param {MulterDropboxValueFunction<import('dropbox').Dropbox>|import('dropbox').Dropbox} client [Dropbox](https://www.npmjs.com/package/dropbox#quickstart) client
    * @param {CommitInfo} opts
    */
  constructor(client, opts) {
    this.client = typeof client == 'function' ? client : staticValue(client);

    METHODS.forEach(method => {
      this[method] = typeof opts[method] == 'function' ? opts[method] : staticValue(opts[method]);
    });

    this.filesCommitInfo = typeof opts.filesCommitInfo == 'function' ? opts.filesCommitInfo : staticValue(opts.filesCommitInfo);
  }

  getFilesCommitInfo(req, file, cb) {
    const tasks = [];

    METHODS.forEach(
      method => {
        tasks.push(this[method].bind(this, req, file))
      }
    );

    parallel(tasks,
      (err, results) => {
        if (err) return cb(err)

        this.filesCommitInfo(req, file, (err2, replacements) => {
          if (err2) return cb(err2)

          let filesCommitInfo = {};

          METHODS.forEach((m, i) => {
            if (typeof results[i] != 'undefined') {
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

  _handleFile(req, file, cb) {

    this.getFilesCommitInfo(req, file, (err, filesCommitInfo) => {
      if (err) return cb(err)

      if (filesCommitInfo && !filesCommitInfo.contents) {
        filesCommitInfo.contents = file.stream;
      }

      this.client(req, file, (err2, client) => {
        if (err2) return cb(err2)

        client.filesUpload(filesCommitInfo).then(
          f => cb(null, f),
          err => {
            cb(err);
          }
        );
      });
    });
  }

  _removeFile(req, file, cb) {
    this.client(req, file, (err, client) => {
      if (err) return cb(err)

      client.filesDeleteV2({ path: file.result.path_display }).then(
        r => cb(null, r),
        err => {
          cb(err);
        }
      );
    });
  }
}

/**
 * 
 * @param {MulterDropboxValueFunction<import('dropbox').Dropbox>|import('dropbox').Dropbox} client [Dropbox](https://www.npmjs.com/package/dropbox#quickstart) client
 * @param {CommitInfo} opts
 */
function multerStorage(client, opts) {
  return new DropboxStorage(client, opts)
}

export default multerStorage;