// requires
require('dotenv').config();
const yargs = require('yargs')(process.argv.slice(2)).argv;;
const scheduler = require('node-schedule');
const envImport = require('@grimtech/envimport');
const execa = require('execa');
const Redis = require("ioredis");
const fsp = require('fs').promises;
const {
	importDatabase,
	exportDatabase,
	getHashesFromData,
	getTemporaryFilename,
	isDatabaseEmpty,
} = require('../common/lib/db');


// constants
const redisConnectionDetails = {
  host: envImport('REDIS_HOST'),
  port: envImport('REDIS_PORT'),
  password: envImport('REDIS_PASSWORD')
};
const schedule = envImport('BACKUP_SCHEDULE');
const bucket = envImport('BACKUP_BUCKET');
envImport('AWS_ACCESS_KEY_ID'); // this and the following env var are imported just to make sure they exist for s3cmd
envImport('AWS_SECRET_ACCESS_KEY');

// class init
const client = new Redis(redisConnectionDetails);


// functions
const getBackupFromS3 = async () => {
	const fileName = getTemporaryFilename();
	await execa('s3cmd', ['get', `s3://${bucket}/futureporn.json`, fileName]);
	const rawData = await fsp.readFile(fileName, { encoding: 'utf-8' });
	return JSON.parse(rawData);
}


const backupToS3 = async () => {
	console.log('Backing up to S3');
	const dbJsonFile = await exportDatabase(client);
	await execa('s3cmd', ['put', dbJsonFile, `s3://${bucket}/futureporn.json`]);
	console.log('Backup complete');
}

const restore = async () => {
	console.log('Restoring database from backup.');
	const data = await getBackupFromS3();
	await importDatabase(client, data);
}


/**
 * ensure that the database is suitable for production.
 * if the database is empty, the a backup will be restored.
 * if the database exists, a backup is made.
 */
const assertDatabase = async () => {
	const isEmpty = await isDatabaseEmpty(client);
	if (isEmpty) {
		console.log('Database is empty.')
		await restore();
	} else {
		await backupToS3();
	}
}

// run
const main = async () => {
	// ensure the database when starting daemon
	await assertDatabase();

	// queue a repeating job to ensure teh database
	const backupJob = scheduler.scheduleJob(schedule, assertDatabase);
	console.log(`backup script will run at ${backupJob.nextInvocation()}`);
};

if (yargs.localImport) {
	console.log('IMPORTING LOCAL DATA INTO THE DATABASE')
	const data = require('../common/util/seedDataFull.json');
	importDatabase(client, data);
} else {
	main();
}