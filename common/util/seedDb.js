#!/usr/bin/env node

require('dotenv').config();

const envImport = require('../lib/envImport');
const data = require('./seedDataFull.json');

const Redis = require("ioredis");
const redisConnectionDetails = {
  host: envImport('REDIS_HOST'),
  port: envImport('REDIS_PORT'),
  password: envImport('REDIS_PASSWORD')
};
const client = new Redis(redisConnectionDetails);
const testHash = 'QmaaS4YJXEwZ7BvzFD5qKnRMgrHiWxPeUXWzVBZFqjYqHg'; // a 1 second test video

let sets = data.map((data) => {
  return ['set', `futureporn:vod:${data.videoSrcHash}`, JSON.stringify(data)];
})

let hashList = data.map((data) => {
  return data.videoSrcHash;
})


client
  .multi(sets)
  .sadd('futureporn:vods', ...hashList)
  .exec()
  .then(() => {
    client.disconnect();
  })
