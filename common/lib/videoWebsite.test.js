const { getDateFromTitle, doDeleteFile } = require('./videoWebsite');
const { DateTime } = require('luxon');
const os = require('os');
const fsp = require('fs').promises;

const makeTestFilePath = () => {
  const date = new Date().valueOf();
  const randomNumber = Math.floor((Math.random()*1000000)+1);
  const testFilePath = `${os.tmpdir()}/${date}-${randomNumber}`;
  return testFilePath;
}

describe('index', () => {
  describe('getDateFromTitle', () => {
    test('should handle a title created by youtube-dl', () => {
      const date = getDateFromTitle('projektmelody 2020-12-21 21_00-projektmelody');
      expect(date).toBe('2020-12-21');
    })
    test('should insert todays date when there is none in the title', () => {
      const today = DateTime.local().toFormat('yyyy-MM-dd');
      const date = getDateFromTitle('projektmelody stream is a cool strim');
      expect(date).toBe(today);
    })
  })
  describe('doDeleteFile', () => {
    test('single file deletion', async () => {
      const testFilePath = makeTestFilePath();
      await fsp.writeFile(testFilePath, 'YOLO', { encoding: 'utf-8' });
      await doDeleteFile(testFilePath);
      const testFileStat = fsp.stat(testFilePath);
      await expect(testFileStat).rejects.toThrow('ENOENT');
    });
    test('multiple file deletion', async () => {
      let testFilePaths = [];
      for (var i=0; i<5; i++) {
        testFilePaths.push(makeTestFilePath());
      }
      for (path of testFilePaths) {
        await fsp.writeFile(path, 'YOLO', { encoding: 'utf-8' });
      }
      await doDeleteFile(testFilePaths);
      for (file of testFilePaths) {
        await expect(fsp.stat(file)).rejects.toThrow('ENOENT');
      }
    })
  })
})
