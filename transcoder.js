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
  doClean,
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
} = require('./lib/videoWebsite');
const envImport = require('./lib/envImport');

const {
  doTranscode360
} = require('./lib/transcode');

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


// subscriber.on('message', (msg) => {
//   const ipfsHash = msg.map(e => e[1]);
//   let doDownloadFile()
// });

// get the vod data
//   {
//   title: title,
//   thiccHash: thiccHash, // this is teh wide and tall thumbnail which serves as the video poster
//   thinHash: thinHash, // this is the wide and short thumbnail which is shown on the main page
//   videoSrcHash: videoSrcHash, // the source video IPFS hash. also serves as an ID in redis.
//   video720Hash: '',
//   video480Hash: '',
//   video360Hash: '' // SD for the rest of the world (and me!)
// }
// transcode
// upload
// save
// publish

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


const obs = fromEvent(subscriber, "message")
  .pipe(
    map(e => e[1]), // get the hash from [ 'futureporn:ripper', ipfshash ]
    flatMap(downloadTranscodeAndUpload)
  );


obs.subscribe((hash) => {
  console.log(`finishing up with ${hash} value`);
  publisher.publish(writeChannel, hash);
});