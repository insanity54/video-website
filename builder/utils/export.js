
const path = require('path');
const globby = require('globby');
const matter = require('gray-matter');
const fsp = require('fs').promises;
const execa = require('execa');


const getVodsAsJson = async () => {
	const vods = await globby(path.join(__dirname, '../website/vods/*.md'));
	for (vod of vods) {
		console.log(`reading ${vod}`);
		const content = await fsp.readFile(vod, { encoding: 'utf-8' });
		const data = await matter(content)
		console.log(data)
	}
}


const withoutBB2 = (vod) => {
	return (typeof vod.data.videoSrc === 'undefined')
}


const uploadToBB2 = async (bucketName, localFilePath, b2FileName) => {
	if (typeof bucketName === 'undefined' || typeof localFilePath === 'undefined' || typeof b2FileName === 'undefined') throw new Error('DERP! 3 params required but didnt get one or more');
	await execa('b2-linux', ['upload-file', bucketName, localFilePath, b2FileName]).stdout.pipe(process.stdout);
}

const downloadFromIPFS = async (hash, localFilePath) => {
	if (typeof hash === 'undefined' || typeof localFilePath === 'undefined') throw new Error('downloadFromIPFS must get two params. one or more was missing.');
	const url = `https://ipfs.io/ipfs/${hash}`;
	await execa('wget', ['-O', localFilePath, url]).stdout.pipe(process.stdout);
}


(async () => {
	const vods = await getVodsAsJson();
	const bb2lessVods = vods.filter(withoutBB2);
	for (vod of vods) {
		const { date, videoSrcHash } = vod.data;
		const fileName = `projektmelolody-chaturbate-${date}.mp4`;
		const pathOnDisk = `/tmp/${fileName}`;

		try {
			await downloadFromIPFS(videoSrcHash, pathOnDisk);
			await uploadToBB2('futureporn', pathOnDisk, fileName);
		} catch (e) {
			console.error('problem while downloading from IPFS or uploading to BB2. Error is as follows.');
			console.error(e);
		}
	}
})()