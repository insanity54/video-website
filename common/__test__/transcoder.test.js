#!/usr/bin/env node

const path = require('path');

const {
  doDownloadFile,
} = require('../lib/videoWebsite');

const {
  doTranscode360
} = require('../lib/transcode');

describe('doDownloadFile', () => {
  test('should dl a file from IPFS given the a hash', async () => {
    let file = await doDownloadFile('QmUAhXy8pzKo5MJrnegw7oTUeBZMrvrTSjL8G6kES8EeBo');
    expect(file).toBe('/tmp/QmUAhXy8pzKo5MJrnegw7oTUeBZMrvrTSjL8G6kES8EeBo');
  })
  test('should transcode a video to 360p', () => {
    let transcodePromise = doTranscode360(path.join(__dirname, 'sample.mp4'));
    return expect(transcodePromise).resolves.toBe('/tmp/sample_transcoded.mp4');
  })
})
