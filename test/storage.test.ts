import multerDbx from '../index'
import { Dropbox } from 'dropbox'
import multer from 'multer'
import { expect } from 'chai'
import fs from 'fs';

describe('multer-dropbox', function () {

  it('should be fine', function(done) {
    // create Dropbox client
    const client = new Dropbox();

    // init storage
    const storage = multerDbx(client, {
      filesCommitInfo: (_req, file, cb) => {
        cb(null, { mute: true, contents: file.stream })
      },
      path: (_req, _file, cb) => {
        cb(null, 'hello/world')
      },
      mute: (_req, _file, cb) => {
        cb(null, false);
      },
      mode: {
        '.tag': 'add'
      }
    });

    // init multer middleware
    multer({ storage });

    // test method
    storage.getFilesCommitInfo({}, {
      path: '',
      destination: '',
      fieldname: 'test',
      filename: 'test',
      mimetype: '',
      originalname: '',
      size: 0,
      stream: fs.createReadStream('index.js'),
      buffer: Buffer.from([]),
      encoding: ''
    }, (err, res) => {
      expect(err).to.be.null;
      expect(res?.path).to.equal('hello/world');
      expect(res?.mute).to.be.true;
      expect(res?.mode).to.be.an('object')
        .that.has.property('.tag')
        .that.equals('add');
      done(err);
    });
  })
});
