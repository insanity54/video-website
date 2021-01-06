const path = require('path');
const os = require('os');
const fs = require('fs');
const fsp = fs.promises;
const ffmpeg = require('fluent-ffmpeg');
const debug = require('debug')('video-website');


/**
 * transcode a video to 360p
 * @param {String}   fileName
 * @return {Promise} transcode
 * @resolve {String} transcodedFileName
 */
const doTranscode360 = (fileName) => {
  debug(`transcoding ${fileName}`);
  return new Promise((resolve, reject) => {
    const { name, ext } = path.parse(fileName);
    const outputVideoPath = path.join(os.tmpdir(), `${name}_360p.mp4`);
    ffmpeg(fileName)
      .size('?x360')
      .save(outputVideoPath)
      .on('end', (stderr, stdout) => {
        if (stderr) reject(stderr);
        resolve(outputVideoPath);
      });
  })
}





module.exports = {
  doTranscode360
}
