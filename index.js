#!/usr/bin/env node

require('dotenv').config();
const debug = require('debug')('video-website');
const globby = require('globby');
const generatePreview = require('ffmpeg-generate-video-preview');
const axios = require('axios');
const chokidar = require('chokidar');
const fs = require('fs');
const fsp = fs.promises;
const path = require('path');
const FormData = require('form-data');
const Neocities = require('neocities-extended');
const Eleventy = require("@11ty/eleventy");




// env vars

const envImport = (name) => {
  const uem = (name) => `${name}  must be defined in env, but it was undefined.`
  if (typeof process.env[name] === 'undefined') throw new Error(uem(name));
  return process.env[name];
}
const DANGER_ZONE = (process.env.DANGER_ZONE === 'true') ? true : false;
if (typeof DANGER_ZONE === 'undefined') throw new Error(uem('DANGER_ZONE'))

const NEOCITIES_SUBDOMAIN = envImport('NEOCITIES_SUBDOMAIN');
const NEOCITIES_API_KEY = envImport('NEOCITIES_API_KEY');
const VIDEO_DIRECTORY = envImport('VIDEO_DIRECTORY'); // the dir where recorded videos are saved. This program will react to new videos.
const PINATA_SECRET_API_KEY = envImport('PINATA_SECRET_API_KEY');
const PINATA_API_KEY = envImport('PINATA_API_KEY');

// constants
const channelNameRegex = /(\S+)\s/;
const videoPartRegex = /.*\.mp4.part/;
const webpageOutputDir = path.join(__dirname, 'dist');
const dataDir = path.join(__dirname, '_data');
const tmpDir = path.join(__dirname, 'tmp');



const doGenerateThumbnail = async (videoPath) => {
  debug(`generating a video preview for ${videoPath}`);
  const { output } = await generatePreview({
    input: videoPath,
    output: `${videoPath}.jpg`,
    width: 256,
    rows: 3,
    cols: 5,
    margin: 4,
    padding: 4
  })
  return output;
};


const doGenerateTitle = (fileName) => {
  let {
    name
  } = path.parse(fileName);
  return name;
}

// upload a file to Pinata (IPFS)
const doUploadFile = (fileName) => {
  const pinataOptions = JSON.stringify({
    wrapWithDirectory: false
  });
  let data = new FormData;
  data.append('file', fs.createReadStream(fileName));
  data.append('pinataOptions', pinataOptions);

  return axios
    .post('https://api.pinata.cloud/pinning/pinFileToIPFS',
      data,
      {
        maxContentLength: 'Infinity',
        headers: {
          'Content-Type': `multipart/form-data; boundary=${data._boundary}`,
          'pinata_api_key': PINATA_API_KEY,
          'pinata_secret_api_key': PINATA_SECRET_API_KEY
        }
      }
    )
    .then((res) => {
      if (res.status !== 200) throw new Error(`${res.status} ${res.statusText}`);
      else return res.data.IpfsHash
    })
}


const waitForNewVideos = () => {
  chokidar.watch(VIDEO_DIRECTORY).on('all', (event, path) => {
    console.log(event, path);
    if (event === 'unlink' && videoPartRegex.test(path)) {
      // a video .mp4.part file was just unlinked which suggests that the video recording just finished.
      doProcessVideo(path);
    }
  });
}

const getChannelName = (title) => {
  return title.match(channelNameRegex)[1];
}

const doProcessVideo = async (videoPath) => {
  // 1. upload the file to pinata
  // 2. generate a video preview image
  // 3. add the video to the webpage
  // 4. upload the webpage to neocities
  // 5. delete the source video

  videoPath = videoPath.split('.').slice(0, -1).join('.');
  debug(`videoPath is ${videoPath}`)
  let title = doGenerateTitle(videoPath);
  let channel = getChannelName(title);
  let thumbnailPath = await doGenerateThumbnail(videoPath);
  let videoUploadP = doUploadFile(videoPath);
  let thumbnailUploadP = doUploadFile(thumbnailPath)
  let [videoHash, thumbnailHash] = await Promise.all([videoUploadP, thumbnailUploadP]);
  debug(`videoHash and the thumbnailHash are as follows`);
  debug(videoHash);
  debug(thumbnailHash);
  let vodJson = await saveVodData(channel, title, videoHash, thumbnailHash);
  debug(`vodJson from the db is as follows`);
  debug(vodJson);
  let distPath = await doBuildWebpage(vodJson);
  await doUploadWebsite(distPath);

  let f = await doClean([videoPath, thumbnailPath])
  debug(`video processing has completed.`)
}

const saveVodData = async (channel, title, videoHash, thumbnailHash) => {
  debug(`saving vod channel:${channel}, title:${title}, videoHash:${videoHash}, thumbnailHash:${thumbnailHash}`);
  let saveFile = path.join(dataDir, 'vods.json');
  let existingData;
  try {
    existingData = require(path.join(dataDir, 'vods.json'));
  } catch (e) {
    existingData = [];
  }
  let newData = { channel, title, videoHash, thumbnailHash };
  existingData.push(newData);
  return fsp
    .writeFile(saveFile, JSON.stringify(existingData))
    .then(() => {
      return existingData;
    })
}

const doBuildWebpage = async (vodJson) => {
    debug(`building webpage with metadata`);
    debug(vodJson);
  	let eleventy = new Eleventy();
  	await eleventy.init();
  	await eleventy.write();
    return webpageOutputDir;
}

const doUploadWebsite = async (distPath) => {
  var api = new Neocities(NEOCITIES_API_KEY);
  return new Promise((resolve, reject) => {
    debug(`uploading files to neocities. distPath:${distPath}`);
    api.push(
      distPath, // local path
      '/',      // webserver path
      [],       // excluded files
      (res) => {
        if (res.result !== 'success') reject(res);
        else (resolve(res.message));
      })
  });
}

const doClean = async (paths) => {
  if (DANGER_ZONE === false) {
    return
  } else {
    debug(`deleting the following files:`);
    let unlinkP = paths.map((p) => {
      debug(`  * ${filePath}`);
      return fsp.unlink(p);
    })
    return Promise.all(unlinkP);
  }
}

const main = (async () => {
  waitForNewVideos();
  // const videoFiles = await globby('./**/*.mp4');
  // const result = await Promise.all(videoFiles.map(doGeneratePreview));
  // console.log(result)
  // await testAuthentication();
})();
