


/**
 * function isApplicableMessage
 *
 * @param {Object|String} message  - the message received from redis. can be JSON or an object
 * @param {String} matchPattern    - the worker pattern to determine whether or not the message is applicable
 */
const isApplicableMessage = (message, matchPattern) => {
	if (typeof message === 'undefined') throw new Error('message is undefined but it must be defined');
	if (typeof matchPattern === 'undefined') throw new Error('matchPattern is undefined but it must be defined');

	// parse, catching errors we do this to accept both a string or an object
	let m;
	try {
		m = JSON.parse(message);
	} catch (e) {
		m = message;
	}

	if (typeof m.worker === 'undefined') {
		console.error('WARNING!!! message.worker was undefined which makes the message an invalid message object for futureporn schema');
		console.error(message);
		return false;
	}

	const pattern = new RegExp(matchPattern);
	if (m.worker.match(pattern))
		return true;
	else
		return false;

}

const buildPayload = (workerName, payload) => {
	if (typeof workerName === 'undefined') throw new Error('workerName passed to buildPayload must be defined but it was empty.');
	if (typeof payload === 'undefined') throw new Error('payload passed to buildPayload must be defined but it was empty.');
	return { worker: workerName, payload: payload };
}

module.exports = {
	isApplicableMessage,
	buildPayload
}