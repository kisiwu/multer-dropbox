# multer-dropbox

Dropbox Multer Storage Engine.

## Installation

```bash
$ npm install multer-dropbox
```

## Usage

`multer-dropbox` exports a function that returns the storage.

### Dropbox

The first argument of the storage is the `Dropbox` instance. It could also be a function that sends the `Dropbox` instance to use.

Example 1: Instance

```js
const multerDbx = require('multer-dropbox');
const { Dropbox } = require('dropbox');
const fetch = require('isomorphic-fetch');

const dbx = new Dropbox({
  accessToken: process.env.ACCESS_TOKEN,
  fetch
});

const storage = multerDbx(
  // instance
  dbx,
  {
	  path: function( req, file, cb ) {
	  	cb( null, '/multer-uploads/' + file.originalname );
	  },
  });
```

Example 2: Function

```js
const multerDbx = require('multer-dropbox');
const { Dropbox } = require('dropbox');
const fetch = require('isomorphic-fetch');

// instance 1
const dbxImages = new Dropbox({
  accessToken: process.env.ACCESS_TOKEN_IMAGES,
  fetch
});
// instance 2
const dbxFiles = new Dropbox({
  accessToken: process.env.ACCESS_TOKEN_FILES,
  fetch
});

const storage = multerDbx(
  // use instance 1 if the file is an image
  function( req, file, cb ) {
      if(file.mimetype.startsWith('image/') {
        cb( null, dbxImages );
      } else {
        cb( null, dbxFiles );
      }
	},
  {
	  path: function( req, file, cb ) {
	  	cb( null, '/multer-uploads/' + file.originalname );
	  },
  });
```

### CommitInfo

The second argument of the storage is the `CommitInfo` (`multerDropbox.CommitInfo`). See more about `CommitInfo` at [Dropbox documentation](https://www.dropbox.com/developers/documentation).

Example 1

```js
const multer = require('multer');
const multerDbx = require('multer-dropbox');
const { Dropbox } = require('dropbox');
const fetch = require('isomorphic-fetch');

const dbx = new Dropbox({
  accessToken: process.env.ACCESS_TOKEN,
  fetch
});

const storage = multerDbx(
  dbx,
  // CommitInfo
  {
    // e.g.: format 'path' value
	  path: function( req, file, cb ) {
	  	cb( null, '/multer-uploads/' + file.originalname );
	  },
    // e.g.: 'mute' value
	  mute: true
  });

const uploadMiddleware = multer({ storage });
```

Example 2

```js
const multer = require('multer');
const multerDbx = require('multer-dropbox');
const { Dropbox } = require('dropbox');
const fetch = require('isomorphic-fetch');

const dbx = new Dropbox({
  accessToken: process.env.ACCESS_TOKEN,
  fetch
});

const storage = multerDbx(
  dbx,
  {
    // format the whole CommitInfo at one time
    filesCommitInfo: function( req, file, cb ) {
      cb( null, {
        path: '/multer-uploads/' + file.originalname,
        mode: {
          '.tag': 'overwrite'
        },
        autorename: true,
        mute: true
      } );
    }
  });

const uploadMiddleware = multer({ storage });
```

In the examples above, we didn't fill the property `CommitInfo['contents']` as it will by default be the uploading file. You could always fill it to override the default behavior.

## References

- [Dropbox](https://www.dropbox.com/developers/documentation)
- [Multer Storage Engine](https://github.com/expressjs/multer/blob/master/StorageEngine.md#multer-storage-engine)