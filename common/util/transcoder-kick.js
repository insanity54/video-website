#!/usr/bin/env node

require('dotenv').config();

const envImport = require('./lib/envImport');

const Redis = require("ioredis");
const redisConnectionDetails = {
  host: envImport('REDIS_HOST'),
  port: envImport('REDIS_PORT'),
  password: envImport('REDIS_PASSWORD')
};
const client = new Redis(redisConnectionDetails);
const channel = 'futureporn:ripper';
const hash = 'QmaaS4YJXEwZ7BvzFD5qKnRMgrHiWxPeUXWzVBZFqjYqHg';

client.publish(channel, hash, () => {
  console.log(`I emitted ${hash} on ${channel}`);
  client.disconnect();
});
