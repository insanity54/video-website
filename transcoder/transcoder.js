#!/usr/bin/env node

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

const readChannel = 'futureporn:ripper';
const writeChannel = 'futureporn:transcoder';
const Redis = require("ioredis");
const redisConnectionDetails = {
  host: envImport('REDIS_HOST'),
  port: envImport('REDIS_PORT'),
  password: envImport('REDIS_PASSWORD')
};

const subscriber = new Redis(redisConnectionDetails);
const publisher = new Redis(redisConnectionDetails);
const client = new Redis(redisConnectionDetails);

publisher.on("error", (error) => console.error(error));
subscriber.on("error", (error) => console.error(error));

subscriber.subscribe(readChannel, (err, count) => {
  if (err) throw err;
  console.log(`subscribed to channel ${readChannel} (${count} count)`);
});


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

// listen to redis for a message on the futureporn channel
fromEvent(subscriber, "message")
  .pipe(
    map(e => e[1]), // get the hash from [ 'futureporn:ripper', ipfshash ]
    flatMap(downloadTranscodeAndUpload)
  ).subscribe((hash) => {
    console.log(`finishing up with ${hash} value`);
    publisher.publish(writeChannel, hash);
  });

const transcodeSingleVideo = async (vod) => {
  console.log(`transcoding ${vod}`);
  let videoFilePath = await doDownloadFile(vod.videoSrcHash);
  let video360pPath = await doTranscode360(videoFilePath);
  let video360Hash = await doUploadFile(video360pPath);
  let newData = doMergeMetadata(vod, { video360Hash });
  await client.set(`futureporn:vod:${vod.videoSrcHash}`, JSON.stringify(newData));
  await doDeleteFile([videoFilePath, video360pPath]);
  return publisher.publish(writeChannel, vod.video360Hash);
}

const transcodeAllVideos = (data) => {
  // compile a list of datums without a 360p encode
  const joblist = data.filter((d) => typeof d.video360Hash === 'undefined');
  return new Promise.mapSeries(joblist, transcodeSingleVideo);
}



const doTranscodeProcess = () => {
  client
    .smembers('futureporn:vods')
    .then((hashes) => {
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


// when starting, check with redis to see if there is work
doTranscodeProcess();

subscriber.on('message', (msg) => {
  console.log(`subscriber emitted message ${msg}`)
  console.log(`  @todo add handler for ^^^`);
})