#!/usr/bin/env node

require('dotenv').config();

const voddo = require('voddo');

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
  buildMetadata,
  doGenerateTitle
} = require('../common/lib/videoWebsite');

const envImport = require('../common/lib/envImport');
const channelUrl = envImport('CHANNEL_URL');

const Redis = require("ioredis");
const redisConnectionDetails = {
  host: envImport('REDIS_HOST'),
  port: envImport('REDIS_PORT'),
  password: envImport('REDIS_PASSWORD')
};
const client = new Redis(redisConnectionDetails);
const publisher = new Redis(redisConnectionDetails);

console.log(`ripping ${channelUrl} ASAP.`);

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




const initialDelay = 1000*5;
const maxDelay = 1000*60*8;


const process = async (fileName) => {
  console.log(`${channelUrl} stream has completed. Stream saved to ${fileName}`);
  console.log(`video processing has completed.`);
  const videoSrcHash = await doUploadFile(fileName);
  const title = doGenerateTitle(fileName);
  console.log(`upload complete.`);
  const metadata = await buildMetadata({ videoSrcHash, title });
  console.log(metadata);
  const saveRes = await saveMetadata(metadata);
  console.log(`metadata has been saved to the db`);
  const channel = 'futureporn';
  await publisher.publish(channel, videoSrcHash);
  console.log(`I emitted ${videoSrcHash} on ${channel}`);
  await doClean();
}


const vee = voddo.watch(channelUrl, initialDelay, maxDelay);
vee.on('complete', process);
