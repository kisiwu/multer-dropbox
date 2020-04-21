# multer-dropbox

Dropbox Multer Storage Engine

Example 1

```js
const multer = require('multer')
const multerDbx = require('multer-dropbox')
const { Dropbox } = require('dropbox')
const fetch = require('isomorphic-fetch')

const dbx = new Dropbox({
  accessToken: process.env.ACCESS_TOKEN,
  fetch
})

const storage = multerDbx(
  dbx,
  {
	  path : function( req, file, cb ) {
    
	  	cb( null, '/multer-uploads/' + file.originalname );

	  },
	  mute: true
  });

var uploadMiddleware = multer({ storage })
```

Example 2

```js
const multer = require('multer')
const multerDbx = require('multer-dropbox')
const { Dropbox } = require('dropbox')
const fetch = require('isomorphic-fetch')

const dbx = new Dropbox({
  accessToken: process.env.ACCESS_TOKEN,
  fetch
})

const storage = multerDbx(
  dbx,
  {
    filesCommitInfo : function( req, file, cb ) {

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

var uploadMiddleware = multer({ storage })
```