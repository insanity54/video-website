#!/usr/bin/env node

require('dotenv').config();

const voddo = require('/home/chris/Documents/voddo');

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
  buildMetadata,
  doGeneratePages
} = require('./lib/videoWebsite');

const envImport = require('./lib/envImport');


const Redis = require("ioredis");
const redisConnectionDetails = {
  host: envImport('REDIS_HOST'),
  port: envImport('REDIS_PORT'),
  password: envImport('REDIS_PASSWORD')
};
const client = new Redis(redisConnectionDetails);
const subscriber = new Redis(redisConnectionDetails);
const publisher = new Redis(redisConnectionDetails);

client.on("error", (err) => console.log(err));
subscriber.on("error", (error) => console.log(error));
publisher.on("error", (error) => console.log(error));

// we subscribe to the transcoder and ripper channels
subscriber.subscribe('futureporn:transcoder', 'futureporn:ripper');


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

// when receiving a message, we build the site.
subscriber.on('message', async (msg) => {
  console.log(`Building the website. msg:${msg}`);
  const metadata = await loadMetadata();
  console.log('got metadata');
  console.log(metadata);
  const count = await doGeneratePages(metadata);
  const dir = await doBuildWebpage();
  // console.log('Uploading the website.');
  // await doUploadWebsite();
});
