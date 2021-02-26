const path = require('path');
const os = require('os');
const fs = require('fs');
const fsp = fs.promises;
const ffmpeg = require('fluent-ffmpeg');
const debug = require('debug')('video-website');
const Prevvy = require('prevvy');


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
      .on('progress', (prog) => debug(`Transcoding ${fileName}: ${prog.percent} done`))
      .on('end', (stderr, stdout) => {
        if (stderr) reject(stderr);
        resolve(outputVideoPath);
      });
  })
}

// functions
const doGenerateThumbnails = async (videoPath) => {
  // videoPath = videoPath.replace(/[\\()$'"\s]/g, '\\$&');
  debug(`generating a thumbnail set for ${videoPath}`);
  const pThicc = new Prevvy({
    input: videoPath,
    output: `${videoPath}_thicc.png`,
    width: 128,
    cols: 5,
    rows: 5
  });
  const pThin = new Prevvy({
    input: videoPath,
    output: `${videoPath}_thin.png`,
    width: 128,
    cols: 5,
    rows: 1
  });
  const { output: thinPath } = await pThin.generate();
  const { output: thiccPath } = await pThicc.generate();
  return {
    thinPath,
    thiccPath
  };
};


module.exports = {
  doTranscode360,
  doGenerateThumbnails
}
