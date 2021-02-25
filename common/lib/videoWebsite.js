require('dotenv').config();
const debug = require('debug')('video-website');
const globby = require('globby');
const Prevvy = require('prevvy');
const fetch = require('node-fetch');
const { pipeline } = require('stream').promises; // requires node >= v15.0.0
const fs = require('fs');
const fsp = fs.promises;
const path = require('path');
const os = require('os');
const FormData = require('form-data');
const Neocities = require('neocities-extended');
const Eleventy = require("@11ty/eleventy");
const { DateTime } = require('luxon');
const envImport = require('./envImport');
const voddo = require('voddo');
const execa = require('execa');


// env vars
const DANGER_ZONE = (process.env.DANGER_ZONE === 'true') ? true : false;
if (typeof DANGER_ZONE === 'undefined') throw new Error(uem('DANGER_ZONE'))
const NEOCITIES_SUBDOMAIN = envImport('NEOCITIES_SUBDOMAIN');
const NEOCITIES_API_KEY = envImport('NEOCITIES_API_KEY');
const PINATA_SECRET_API_KEY = envImport('PINATA_SECRET_API_KEY');
const PINATA_API_KEY = envImport('PINATA_API_KEY');
const NODE_ENV = envImport('NODE_ENV');


// constants
const channelNameRegex = /(\S+)\s/;
const dateRegex = /\S+\s(\d+-\d+-\d+)/;
const videoPartRegex = /.*\.mp4.part/;
const projectRootPath =  path.join(__dirname, '..', '..');
const webpageOutputDir = path.join(projectRootPath, 'builder', '_site');
const webpageInputDir = path.join(projectRootPath, 'builder', 'website');
const dataDir = path.join(webpageInputDir, '_data');
const tmpDir = path.join(projectRootPath, 'tmp');
const vodsDir = path.join(webpageInputDir, 'vods');



/**
  Build metadata object, one per vod.
  This is what is saved to redis and it is enough for the transcoder
  And builder components to do their job.
*/
const buildMetadata = (data) => {
  const { videoSrcHash, thiccHash, thinHash, title, date } = data;
  const metadata = {
    date: date || new Date(),
    title: title || '',
    thiccHash: thiccHash || '', // this is teh wide and tall thumbnail which serves as the video poster
    thinHash: thinHash || '', // this is the wide and short thumbnail which is shown on the main page
    videoSrcHash: videoSrcHash || '', // the source video IPFS hash. also serves as an ID in redis.
    video720Hash: '',
    video480Hash: '',
    video360Hash: '' // SD for the rest of the world (and me!)
  }
  return metadata;
}

const doMergeMetadata = (oldMeta, newMeta) => {
  if (typeof oldMeta === 'string') throw new Error('oldMeta must be a POJO');
  if (typeof newMeta === 'string') throw new Error('newMeta must be a POJO');
  return Object.assign({}, oldMeta, newMeta);
}


// functions
const doGenerateThumbnails = async (videoPath) => {
  // videoPath = videoPath.replace(/[\\()$'"\s]/g, '\\$&');
  debug(`generating a video preview for ${videoPath}`);
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


const doGenerateTitle = (fileName) => {
  let {
    name
  } = path.parse(fileName);
  return name;
}

const doDownloadFile = async (ipfsHash) => {
  debug(`downloading IPFS hash ${ipfsHash}`);
  const options = {
    method: 'GET'
  }

  const response = await fetch(`https://ipfs.io/ipfs/${ipfsHash}`, options);
  if (!response.ok) throw new Error(`error when fetching ${ipfsHash} ${response.statusText}`);

  const dlPath = path.join(os.tmpdir(), `${ipfsHash}`);
  await pipeline(response.body, fs.createWriteStream(dlPath));
  return dlPath;
}

const doUploadFiles = (fileObject) => {
  const { videoPath, thiccPath, thinPath } = fileObject;
  if (typeof videoPath === 'undefined') throw new Error('videoPath must exist on the fileObject passed to doUploadFiles. Got undefined.')
  if (typeof thiccPath === 'undefined') throw new Error('thiccPath must exist on the fileObject passed to doUploadFiles. Got undefined.')
  if (typeof thinPath === 'undefined') throw new Error('thinPath must exist on the fileObject passed to doUploadFiles. Got undefined.')
  let videoUploadP = doUploadFile(videoPath);
  let thiccThumbnailUploadP = doUploadFile(thiccPath);
  let thinThumbnailUploadP = doUploadFile(thinPath);
  return Promise.all([
    videoUploadP,
    thiccThumbnailUploadP,
    thinThumbnailUploadP
  ]).then((hashArray) => {
    return {
      videoSrcHash: hashArray[0],
      thiccHash: hashArray[1],
      thinHash: hashArray[2],
      title: doGenerateTitle(videoPath)
    }
  })
}


// upload a file to Pinata (IPFS)
const doUploadFile = (fileName) => {
  debug(`uploading ${fileName}`);
  const pinataOptions = JSON.stringify({
    wrapWithDirectory: false
  });
  let data = new FormData;
  data.append('file', fs.createReadStream(fileName));
  data.append('pinataOptions', pinataOptions);

  const options = {
    method: 'POST',
    body: data,
    maxContentLength: 'Infinity',
    headers: {
      'Content-Type': `multipart/form-data; boundary=${data._boundary}`,
      'pinata_api_key': PINATA_API_KEY,
      'pinata_secret_api_key': PINATA_SECRET_API_KEY
    }
  }
  return fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', options)
    .then((res) => {
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
      return res.json();
    }).then((data) => {
      debug(data);
      return data.IpfsHash;
    });
}




const waitForNewVideos = () => {
  // eww
  // chokidar.watch(VIDEO_DIRECTORY).on('all', (event, path) => {
  //   if (event === 'unlink' && videoPartRegex.test(path)) {
  //     debug(`unlink ${path}`)
  //     // a video .mp4.part file was just unlinked which suggests that the video recording just finished.
  //     doProcessVideo(path);
  //   }
  // });
  // @todo this would be nice. https://github.com/insanity54/video-website/issues/4
  voddo
    .watch(['https://chaturbate.com/projektmelody/'])
    .on('complete', (path) => {
      debug('The livestream has completed.')
      doProcessVideo(path);
    })
}

const getChannelName = (title) => {
  let parse = title.match(channelNameRegex)
  if (!parse) throw new Error(`The video title, "${title}" doesn't match the required format.`);
  return parse[1];
}



const doMinVideoProcess = async (videoPath) => {
  // 1. generate thumbnails
  // 2. return with data
  let { thiccPath, thinPath } = await doGenerateThumbnails(videoPath);
  return { videoPath, thiccPath, thinPath };
}

const doProcessVideo = async (videoPath) => {
  // 1. upload the file to pinata
  // 2. generate a video preview image
  // 3. add the video to the webpage
  // 4. upload the webpage to neocities
  // 5. delete the source video

  videoPath = videoPath.split('.').slice(0, -1).join('.');
  debug(`videoPath is ${videoPath}`);
  let title = doGenerateTitle(videoPath);
  let channel = getChannelName(title);
  let { thiccPath, thinPath } = await doGenerateThumbnails(videoPath);
  let videoUploadP = doUploadFile(videoPath);
  let thiccThumbnailUploadP = doUploadFile(thiccPath);
  let thinThumbnailUploadP = doUploadFile(thinPath);
  let [videoHash, thiccThumbnailHash, thinThumbnailHash] = await Promise.all([
    videoUploadP,
    thiccThumbnailUploadP,
    thinThumbnailUploadP
  ]);
  await savePageMarkdown(channel, title, videoHash, thiccThumbnailHash, thinThumbnailHash);
  let distPath = await doBuildWebpage();
  await doUploadWebsite(distPath);

  let f = await doDeleteFile([videoPath, thiccPath, thinPath]);
  console.log(`video processing has completed.`)
}

/**
 * DEPRECATED
 */
const getDateFromTitle = (title) => {
  let o = title.match(dateRegex);
  let date;
  if (!o) {
    date = DateTime.local().toFormat('yyyy-MM-dd');
  } else {
    date = DateTime.fromISO(o[1]).toFormat('yyyy-MM-dd')
  }
  return date;
}

const savePageMarkdown = async (datum) => {
  let {
    thiccHash,
    thinHash,
    videoSrcHash,
    video720Hash,
    video480Hash,
    video360Hash,
    title,
    announceTitle,
    announceUrl,
    date,
  } = datum;
  debug(`generating vod title:${title}, date:${date}, videoSrcHash:${videoSrcHash}, thiccHash:${thiccHash}, thinHash:${thinHash}`);
  const vob = (itm) => {
    return (typeof itm !== 'undefined') ? itm : ''; // "value or blank"
  };
  let template =
    '---\n'+
    `title: ${vob(title)}\n`+
    `videoSrcHash: ${vob(videoSrcHash)}\n`+
    `video720Hash: ${vob(video720Hash)}\n`+
    `video480Hash: ${vob(video480Hash)}\n`+
    `video360Hash: ${vob(video360Hash)}\n`+
    `thinHash: ${vob(thinHash)}\n`+
    `thiccHash: ${vob(thiccHash)}\n`+
    `announceTitle: ${vob(announceTitle)}\n`+
    `announceUrl: ${vob(announceUrl)}\n`+
    `date: ${vob(date)}\n`+
    'layout: layouts/vod.njk\n'+
    '---\n';
  console.log(template);
  let saveFile = path.join(vodsDir, `${date}.md`);
  return fsp
    .writeFile(saveFile, template)
}

const deleteAllPages = async () => {
  debug('starting fresh')
  let files = await fsp.readdir(vodsDir);
  let unlinksP = files.map((f) => {
    const { ext } = path.parse(f);
    if (ext === '.md') {
      const file = path.join(vodsDir, f);
      return fsp.unlink(file);
    }
  })
  return Promise.all(unlinksP);
}


/**
 * For each datum, render a markdown file in <project_root>/website/vods
 *
 * @param {Object} data - the data with which to render markdown files
 * @returns {Number} count - the number of rendered pages
 */
const doGeneratePages = async (data) => {
  debug('generating pages from data');
  // first we delete all markdown, so the redis db remains our source of truth
  await deleteAllPages();
  let count = 0;
  data.forEach((datum) => {
    savePageMarkdown(datum);
    count++;
  });
  return count;
}

const doBuildWebpage = async () => {
    debug(`building webpage in ${webpageInputDir}`);
  	let eleventyProcess = await execa('eleventy', '', { cwd: path.join(webpageInputDir, '..') });
    return webpageOutputDir;
}

const doUploadWebsite = async (distPath) => {
  if (typeof distPath === 'undefined') throw new Error('distPath argument passed to doUploadWebsite must be a path on disk. Got undefined.');
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

// @todo handle a single path
const doDeleteFile = async (paths) => {
  if (typeof paths === 'undefined') throw new Error('arg1 (paths) passed to doDeleteFile() must be defined. It was undefined.');
  if (NODE_ENV !== 'production') {
    return
  } else {
    debug(`deleting the following files:`);
    let unlinkP = paths.map((p) => {
      debug(`  * ${p}`);
      return fsp.unlink(p);
    })
    return Promise.all(unlinkP);
  }
}



module.exports = {
  doDeleteFile,
  doUploadWebsite,
  doUploadFile,
  doUploadFiles,
  doDownloadFile,
  doBuildWebpage,
  buildMetadata,
  savePageMarkdown,
  getDateFromTitle,
  doProcessVideo,
  doMinVideoProcess,
  getChannelName,
  waitForNewVideos,
  doMergeMetadata,
  doGeneratePages,
  doGenerateTitle,
}
