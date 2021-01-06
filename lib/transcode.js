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
    const baseName = path.parse(fileName).name;
    const outputPath = path.join(os.tmpdir(), `${baseName}_transcoded.mp4`);
    ffmpeg(fileName)
      .size('640x360')
      .save(outputPath)
      .on('end', (stderr, stdout) => {
      if (stderr) reject(stderr);
      resolve(outputPath);
    });
  })
}



module.exports = {
  doTranscode360
}
