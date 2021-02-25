#!/usr/bin/env node

// requires
require('dotenv').config();

const {
  fromEvent,
  from,
  combineLatest,
} = require('rxjs');

const {
  flatMap,
  map,
} = require('rxjs/operators');

const {
  isApplicableMessage,
  buildPayload
} = require('../common/lib/pubsub');

const {
  doDeleteFile,
  doUploadWebsite,
  doBuildWebpage,
  doUploadFile,
  doUploadFiles,
  doDownloadFile,
  saveVodData,
  getDateFromTitle,
  doProcessVideo,
  doMinVideoProcess,
  getChannelName,
  waitForNewVideos,
  saveMetadata,
  doMergeMetadata
} = require('../common/lib/videoWebsite');
const envImport = require('../common/lib/envImport');

const Promise = require('bluebird');

const {
  doTranscode360
} = require('../common/lib/transcode');


// constants
const pubsubChannel = 'futureporn';
const workerName = 'transcoder';

// init
const Redis = require("ioredis");
const redisConnectionDetails = {
  host: envImport('REDIS_HOST'),
  port: envImport('REDIS_PORT'),
  password: envImport('REDIS_PASSWORD')
};

const subscriber = new Redis(redisConnectionDetails);
const publisher = new Redis(redisConnectionDetails);
const client = new Redis(redisConnectionDetails);

subscriber.on("error", (error) => console.error(error));
publisher.on("error", (error) => console.error(error));
client.on("error", (error) => console.error(error));

subscriber.subscribe(pubsubChannel, (err, count) => {
  if (err) throw err;
  console.log(`subscribed to channel ${pubsubChannel} (${count} count)`);
});


// functions
const doLoadMetadata = async (hash) => {
  const data = await client.get(`futureporn:vod:${hash}`);
  let d;
  try {
    d = JSON.parse(data);
  } catch (e) {
    console.error('error while trying to parse json data from redis');
    throw e;
  }
  return d;
}

const doSaveMetadata = async (hash, data) => {
  if (typeof data === 'string') throw new Error('data sent to doSaveMetadata should be a POJO, not a string.');
  const d = JSON.stringify(data);
  const res = await client.set(`futureporn:vod:${hash}`, d);
  return;
}

const downloadTranscodeAndUpload = async (hash) => {
  let file = await doDownloadFile(hash);
  let tFile = await doTranscode360(file);
  let tHash = await doUploadFile(tFile);
  let oldData = await doLoadMetadata(hash);
  let newData = { video360Hash: tHash };
  let updated = await doMergeMetadata(oldData, newData);
  await doSaveMetadata(hash, updated);
  return hash;
}


const transcodeSingleVideo = async (vod) => {
  console.log(`transcoding ${vod.videoSrcHash}`);
  let videoFilePath = await doDownloadFile(vod.videoSrcHash);
  let video360pPath = await doTranscode360(videoFilePath);
  let video360Hash = await doUploadFile(video360pPath);
  let newData = doMergeMetadata(vod, { video360Hash });
  await client.set(`futureporn:vod:${vod.videoSrcHash}`, JSON.stringify(newData));
  await doDeleteFile([videoFilePath, video360pPath]);
  return publisher.publish(pubsubChannel, JSON.stringify(buildPayload(workerName, video360Hash)));
}

const transcodeAllVideos = (data) => {
  // compile a list of datums without a 360p encode
  console.log('here be the data')
  console.log(data);
  const joblist = data.filter((d) => {
    return (
      typeof d.video360Hash === 'undefined' ||
      d.video360Hash === ''
    );
  });
  console.log(`here is the joblist`);
  console.log(joblist);
  return new Promise.mapSeries(joblist, transcodeSingleVideo);
}



const doTranscodeProcess = () => {
  client
    .smembers('futureporn:vods')
    .then((hashes) => {
      console.log('here be the hashes')
      console.log(hashes);
      // compile a list of GET commands and then execute them
      let keys = hashes.map((hash) => `futureporn:vod:${hash}`);
      let gets = keys.map((key) => ['get', key]);
      return client.multi(gets).exec();
    })
    .then((res) => {
      // catch any errors
      return res.map((r) => {
        if (r[0] !== null) throw r[0]; // throw if error
        return r[1];
      })
    })
    .then((res) => {
      // JSON parse
      return res.map((r) => {
        return JSON.parse(r);
      })
    })
    .then(transcodeAllVideos)
    .catch((e) => {
      console.error('there was a problem while finding work via redis.')
      console.error(e);
    })
    .then(() => {
      console.log('Transcode process complete.')
    })
}


// run
const main = (async () => {
  // when starting, check with redis to see if there is work
  await doTranscodeProcess();

  subscriber.on('message', async (msg) => {
    if (!isApplicableMessage(msg, 'ripper')) return;
    console.log(`another node emitted message ${msg}. Beginning transcode process`);
    await doTranscodeProcess();
  })
})();
