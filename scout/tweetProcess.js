const deriveTitle = (text) => {
	// greetz https://www.urlregex.com/
	const urlRegex = /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[\-;:&=\+\$,\w]+@)?[A-Za-z0-9\.\-]+|(?:www\.|[\-;:&=\+\$,\w]+@)[A-Za-z0-9\.\-]+)((?:\/[\+~%\/\.\w\-_]*)?\??(?:[\-\+=&;%@\.\w_]*)#?(?:[\.\!\/\\\w]*))?)/g;
	let title = text
		.replace(urlRegex, '') // remove urls
		.replace(/\n/g, ' ')   // replace newlines with spaces
		.replace(/\s+$/, '');  // remove trailing whitespace
	return title;
}


const getFullTweetText = (tweet) => {
	let truncated = tweet.truncated;
	if (truncated) return tweet.extended_tweet.full_text;
	else return tweet.text;
}

const processTweet = (tweet) => {
	console.log('>>> Processing Tweet');
	console.log(tweet);
	let tweetId = tweet.id_str;
	let tweetText = getFullTweetText(tweet);
	let date = tweet.timestamp_ms;
	let screenName = tweet.user.screen_name;
	let announceUrl = `https://twitter.com/${screenName}/status/${tweetId}`;
	let announceTitle = deriveTitle(tweetText);
	console.log(`announceTitle: ${announceTitle}`);
	console.log(`announceUrl: ${announceUrl}`);
	return {
		tweetId,
		tweetText,
		date,
		screenName,
		announceUrl,
		announceTitle
	};
}


module.exports = {
	deriveTitle,
	processTweet,
	getFullTweetText
}