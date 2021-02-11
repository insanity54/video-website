#!/usr/bin/env node

require('dotenv').config();
const argv = require('yargs/yargs')(process.argv.slice(2)).argv;

const { doUploadFile } = require('../lib/videoWebsite');

if (typeof argv.file === 'undefined') throw new Error('argv.file must be defined');

const main = (async () => {
	const result = await doUploadFile(argv.file);
	console.log(result);
})();