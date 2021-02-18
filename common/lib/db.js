const fsp = require('fs').promises;


const getSetCommandsFromData = (data) => {
	if (typeof data === 'undefined') throw new Error('data must be defined')
	return data.map((data) => {
  		return ['set', `futureporn:vod:${data.videoSrcHash}`, JSON.stringify(data)];
	})
}


const getHashesFromData = (data) => {
	if (typeof data === 'undefined') throw new Error('data must be defined')
	return data.map((data) => {
  		return data.videoSrcHash;
	})

}



const importDatabase = (client, data) => {
	if (typeof client === 'undefined') throw new Error('client must be defined')
	if (typeof data === 'undefined') throw new Error('data must be defined')
	console.log(data);
	const hashList = getHashesFromData(data);
	console.log(hashList);
	const setCommands = getSetCommandsFromData(data);
	console.log(setCommands);
	return client
	  .multi(setCommands)
	  .sadd('futureporn:vods', ...hashList)
	  .exec()
}

const getTemporaryFilename = () => {
	const date = new Date().valueOf();
	return `/tmp/futureporn_${date}.json`;
}

const exportDatabase = async (client) => {
	if (typeof client === 'undefined') throw new Error('client must be defined')
	const filePath = getTemporaryFilename();
	const members = await getVodHashes(client);
	const keys = members.map((hash) => {
		return `futureporn:vod:${hash}`;
	});
	const data = await client.mget(keys);
	const dataArray = data.map((datum) => JSON.parse(datum) );


	await fsp.writeFile(filePath, JSON.stringify(dataArray));
	return filePath;
}

const getVodHashes = async (client) => {
	if (typeof client === 'undefined') throw new Error('client must be defined')
	const members = await client.smembers('futureporn:vods');
	return members;
}

const isDatabaseEmpty = async (client) => {
	if (typeof client === 'undefined') throw new Error('client must be defined')
	const vodHashes = await getVodHashes(client);
	if (vodHashes.length < 1)
		return true;
	else
		return false;
}


module.exports = {
	getHashesFromData,
	importDatabase,
	exportDatabase,
	getSetCommandsFromData,
	getTemporaryFilename,
	isDatabaseEmpty,
}

