

const Twitter = require('twitter-lite');

const twitterConsumerKey = envImport('TWITTER_CONSUMER_KEY');
const twitterConsumerSecret = envImport('TWITTER_CONSUMER_SECRET');
const twitterAccessToken = envImport('TWITTER_ACCESS_TOKEN');
const twitterTokenSecret = envImport('TWITTER_TOKEN_SECRET');
const timeout = 60*1000; // optional HTTP request timeout to apply to all requests.
const strictSSL = true;  // optional - requires SSL certificates to be valid.


var T = new Twitter({
	version: "2.0",
  consumer_key:         twitterConsumerKey,
  consumer_secret:      twitterConsumerSecret,
  access_token_key:     twitterAccessToken,
  access_token_secret:  twitterTokenSecret
})




T.get('tweets/search/stream', {
	tweet.fields: {
		author_id: "projektmelody",
		text: 'chaturbate.com/in'
	}, function(err, data, response) {
  console.log(data)
})
