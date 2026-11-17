import { defineConfig } from 'kaukau/config'

export default defineConfig({
  enableLogs: true,
  exitOnFail: false,
  files: 'test',
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
  },
  parameters: [
    {
      kaukauOptions: {
        ext: '.test.ts',
      }
    },
    {
      kaukauOptions: {
        ext: '.test.mjs',
      }
    },
    {
      kaukauOptions: {
        ext: '.test.cjs',
      }
    }
  ]
})
