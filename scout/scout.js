

const Twit = require('twit');

const twitterConsumerKey = envImport('TWITTER_CONSUMER_KEY');
const twitterConsumerSecret = envImport('TWITTER_CONSUMER_SECRET');
const twitterAccessToken = envImport('TWITTER_ACCESS_TOKEN');
const twitterTokenSecret = envImport('TWITTER_TOKEN_SECRET');
const timeout = 60*1000; // optional HTTP request timeout to apply to all requests.
const strictSSL = true;  // optional - requires SSL certificates to be valid.


var T = new Twit({
  consumer_key:         twitterConsumerKey,
  consumer_secret:      twitterConsumerSecret,
  access_token:         twitterAccessToken,
  access_token_secret:  twitterTokenSecret,
  timeout_ms:           timeout,
  strictSSL:            scrictSSL,
})


T.get('search/tweets', { screen_name: "projektmelody", q: 'chaturbate since:2011-07-11', count: 100 }, function(err, data, response) {
  console.log(data)
})
