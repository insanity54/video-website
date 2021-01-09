#!/usr/bin/env node

require('dotenv').config();

const {
  fromEvent,
  from
} = require('rxjs');

const {
  flatMap,
  map,
} = require('rxjs/operators');

const voddo = require('voddo'); @todo

const {
  doClean,
  doUploadWebsite,
  doBuildWebpage,
  doUploadFile,
  doUploadFiles,
  saveVodData,
  getDateFromTitle,
  doProcessVideo,
  doMinVideoProcess,
  getChannelName,
  waitForNewVideos,
  buildMetadata
} = require('common/lib/videoWebsite');

const envImport = require('common/lib/envImport');


const Redis = require("ioredis");
const redisConnectionDetails = {
  host: envImport('REDIS_HOST'),
  port: envImport('REDIS_PORT'),
  password: envImport('REDIS_PASSWORD')
};
const client = new Redis(redisConnectionDetails);
const publisher = new Redis(redisConnectionDetails);

client.on("error", (err) => console.log(err));
publisher.on("error", (error) => console.log(error));

const saveMetadata = (metadata) => {
  const { videoSrcHash } = metadata;
  return client.multi()
    .sadd(`futureporn:vods`, videoSrcHash) // the videoSrcHash serves as the ID in redis
    .set(`futureporn:vod:${videoSrcHash}`, JSON.stringify(metadata))
    .exec()
    .then(responses => {
      responses.forEach((r) => {
        if (r[0] !== null) throw r[0];
      })
      return videoSrcHash
    })
};


const vee = voddo.watch(["https://chaturbate.com/projektmelody"], 1000*5, 1000*60*1);
const ripObs = fromEvent(vee, "complete");
const processObs = ripObs.pipe(flatMap(doMinVideoProcess));
const uploadObs = processObs.pipe(flatMap(doUploadFiles));
const metadataObs = uploadObs.pipe(map(buildMetadata));
const saveObs = metadataObs.pipe(flatMap(saveMetadata));

saveObs.subscribe(hash => {
  console.log(`publishing hash ${hash} on the redis channel futureporn:ripper`)
  publisher.publish("futureporn:ripper", hash);
});
