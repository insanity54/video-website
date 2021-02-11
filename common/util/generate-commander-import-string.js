#!/usr/bin/env node


const dataFull = require('./seedDataFull.json');

const videoSrcHashes = [];

// get list of videoSrcHashes
for (var i=0; i<dataFull.length; i++) {
	videoSrcHashes.push(`SADD futureporn:vods ${dataFull[i]['videoSrcHash']}`);
}



dataFull.forEach((vod) => {
	console.log(`SET futureporn:vod:${vod.videoSrcHash} "${JSON.stringify(vod)}"`);
})

videoSrcHashes.forEach((saddString) => {
	console.log(saddString);
});



