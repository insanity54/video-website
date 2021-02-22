// determines the functionality of this instance
// based on the value of env var FUNCTION

require('dotenv').config();
const envImport = require('./common/lib/envImport');
const f = envImport('FUNCTION');

if (f === 'ripper') {
	require('./ripper/ripper');
} else if (f === 'transcoder') {
	require('./transcoder/transcoder');
} else if (f === 'builder') {
	require('./builder/builder');
} else if (f === 'backup') {
	require('./backup/backup');
} else if (f === 'analyzer') {
	require('./analyzer/analyzer');
}
