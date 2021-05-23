
require('dotenv').config();
const envImport = require('@grimtech/envimport');
const Twitter = require('twitter-lite');
const { processTweet } = require('./tweetProcess');

const twitterConsumerKey = envImport('TWITTER_CONSUMER_KEY');
const twitterConsumerSecret = envImport('TWITTER_CONSUMER_SECRET');
const twitterAccessToken = envImport('TWITTER_ACCESS_TOKEN');
const twitterTokenSecret = envImport('TWITTER_TOKEN_SECRET');
const timeout = 60*1000; // optional HTTP request timeout to apply to all requests.
const strictSSL = true;  // optional - requires SSL certificates to be valid.

const projektMelodyTwitterId = '1148121315943075841';


var client = new Twitter({
	consumer_key:         twitterConsumerKey,
	consumer_secret:      twitterConsumerSecret,
	access_token_key:     twitterAccessToken,
	access_token_secret:  twitterTokenSecret
})


const parameters = {
	follow: projektMelodyTwitterId,
	track: "chaturbate.com/in"
}




const stream = client.stream('statuses/filter', parameters)
	.on("data", processTweet)
	.on('end', res => console.log(`end event has been triggered with ${res}`));


