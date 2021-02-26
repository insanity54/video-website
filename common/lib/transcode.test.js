const { doGenerateThumbnails } = require('./transcode');
const ffmpeg = require('fluent-ffmpeg');
const os = require('os');


describe('transcode', () => {
  describe('doGenerateThumbnails', () => {
    let testVideoPath = `${os.tmpdir()}/testVideo.mp4`;
    test('thumbnail generation', async () => {
      // create a test video
      // ffmpeg -f lavfi -i smptebars -t 30 smpte.mp4
      // greetz https://stackoverflow.com/questions/11640458/how-can-i-generate-a-video-file-directly-from-an-ffmpeg-filter-with-no-actual-in
      await new Promise((resolve, reject) => {
        ffmpeg()
          .input('smptebars')
          .inputFormat('lavfi')
          .addOption('-t', '15')
          .addOption('-pix_fmt', 'yuv420p')
          .save(testVideoPath)
          .on('end', () => {
            resolve();
          })
          .on('error', (e) => {
            reject(e);
          })
      })
      const { thinPath, thiccPath } = await doGenerateThumbnails(testVideoPath);
      expect(thinPath).toStrictEqual(`${testVideoPath}_thin.png`);
      expect(thiccPath).toStrictEqual(`${testVideoPath}_thicc.png`);
    })
  })
})