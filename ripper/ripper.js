#!/usr/bin/env node

// requires
require('dotenv').config();

const voddo = require('voddo');
const ytdlWrap = require('youtube-dl-wrap');
const scheduler = require('node-schedule');
const fsp = require('fs').promises;
const { buildPayload } = require('../common/lib/pubsub');
const {
  doDeleteFile,
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

// constants
const channelUrl = envImport('CHANNEL_URL');
const workerName = 'ripper';
const pubsubChannel = 'futureporn';
const initialDelay = 1000*5;
const maxDelay = 1000*60*8;



// init
const Redis = require("ioredis");
const redisConnectionDetails = {
  host: envImport('REDIS_HOST'),
  port: envImport('REDIS_PORT'),
  password: envImport('REDIS_PASSWORD')
};
const client = new Redis(redisConnectionDetails);
const publisher = new Redis(redisConnectionDetails);
const ytdl = new ytdlWrap();


client.on("error", (err) => console.log(err));
publisher.on("error", (error) => console.log(error));

// func
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

const updateYtdl = async () => {
  console.log('updating youtube-dl');
  const ytdlBinPath = '/usr/local/bin/youtube-dl';
  await ytdlWrap.downloadFromWebsite(ytdlBinPath, 'linux');
  await fsp.chmod(ytdlBinPath, '0775');
  const version = await ytdl.getVersion();
  console.log(`Updated to youtube-dl ${version}`);
}



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
  const payload = JSON.stringify(buildPayload(workerName, videoSrcHash))
  await publisher.publish(channel, payload);
  console.log(`I emitted '${payload}' on ${channel}`);
  await doDeleteFile(fileName);
}

// run
console.log(`ripping ${channelUrl} ASAP.`);
// watch voddo events and wait for a new video
const vee = voddo.watch(channelUrl, initialDelay, maxDelay);
vee.on('complete', process);

// update youtube-dl when starting the daemon
updateYtdl();

// every day at 7AM, update youtube-dl
scheduler.scheduleJob('15 15 8 * * *', updateYtdl);
