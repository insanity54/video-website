#!/usr/bin/env node


const {
  doClean,
  doUploadWebsite,
  doBuildWebpage,
  saveVodData,
  getDateFromTitle,
  doProcessVideo,
  getChannelName,
  waitForNewVideos,
  envImport
} = require('./lib/videoWebsite');



const redis = require("redis");
const client = redis.createClient({
  host: envImport('REDIS_HOST'),
  port: envImport('REDIS_PORT'),
  password: envImport('REDIS_PASSWORD')
});

client.on("error", function(error) {
  console.error(error);
});

client.set("key", "value", redis.print);
client.get("key", redis.print);







const main = (async () => {
  waitForNewVideos();
  doBuildWebpage();
})();
