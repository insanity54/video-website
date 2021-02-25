#!/usr/bin/env node

require('dotenv').config();


const {
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
  buildMetadata,
  doGeneratePages
} = require('../common/lib/videoWebsite');
const {
  buildPayload,
  isApplicableMessage
} = require('../common/lib/pubsub');

const envImport = require('../common/lib/envImport');


// constants
const workerName = 'builder';
const pubsubChannel = 'futureporn';

// init
const Redis = require("ioredis");
const redisConnectionDetails = {
  host: envImport('REDIS_HOST'),
  port: envImport('REDIS_PORT'),
  password: envImport('REDIS_PASSWORD')
};
const client = new Redis(redisConnectionDetails);
const subscriber = new Redis(redisConnectionDetails);
const publisher = new Redis(redisConnectionDetails);
const nodeEnv = envImport('NODE_ENV');
//
client.on("error", (err) => console.log(err));
subscriber.on("error", (error) => console.log(error));
publisher.on("error", (error) => console.log(error));

// we subscribe to the transcoder and ripper channels
subscriber.subscribe(pubsubChannel);


const loadMetadata = async () => {
  let vods = await client.smembers(`futureporn:vods`);
  let gets = vods.map((vodHash) => {
    return ['get', `futureporn:vod:${vodHash}`]
  })
  return client
    .multi(gets)
    .exec()
    .then((responses) => {
      console.log('responses');
      console.log(responses);
      return responses.map((r) => {
        if (r[0] !== null) throw r[0]; // throw if error
        return r[1];
      })
    })
    .then((data) => {
      return data.map((datum) => {
        let d;
        try {
          d = JSON.parse(datum);
        } catch (e) {
          console.error(`could not parse data ${datum}`);
          throw e;
        }
        return d;
      })
    })
};

const doBuildProcess = async () => {
  console.log(`Building the website.`);
  const metadata = await loadMetadata();
  console.log('got metadata');
  console.log(metadata);
  const count = await doGeneratePages(metadata);
  const dir = await doBuildWebpage();
  console.log(`webpage outputted to ${dir}`);
  console.log('Uploading the website.');
  if (nodeEnv === 'development') {
    console.log('UPLOAD SKIPPED BECAUSE THIS IS DEVELOPMENT ENVIRONMENT');
  } else {
    await doUploadWebsite(dir);
  }
  console.log('build process completed.');
  publisher.publish(pubsubChannel, JSON.stringify(buildPayload(workerName, 'Build complete.')));
}

// build the site when a message is heard on the futureporn:transcoder channel
subscriber.on('message', async (channel, msg) => {
  console.log(`got a message. channel:${channel} msg:${msg}`);
  console.log(msg);
  if (!isApplicableMessage(msg, 'transcoder|ripper|scout')) return;
  console.log(`Got message from subscriber. ${msg}`);
  doBuildProcess();
});


// do the build process on startup
doBuildProcess();
