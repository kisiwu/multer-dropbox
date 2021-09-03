module.exports = {
  enableLogs: true,
  exitOnFail: true,
  files: 'test',
  ext: '.test.ts',
  options: {
    bail: false,
    fullTrace: true,
    grep: '',
    ignoreLeaks: false,
    reporter: 'spec',
    retries: 0,
    slow: 200,
    timeout: 2000,
    ui: 'bdd',
    color: true,
  }
};
