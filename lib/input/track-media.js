const Twit = require('twit'),
  bignum = require('bignum'),
  storage = require('../storage'),
  mediaStorage = require('../media');

let defaultTweetOptions = {
    count: 200,
    include_rts: false,
    contributor_details: false,
    trim_user: false,
    tweet_mode: 'extended',
  },
  twit;

try {
  twit = new Twit({
    consumer_key:         process.env.TWITTER_CONSUMER_KEY,
    consumer_secret:      process.env.TWITTER_CONSUMER_SECRET,
    access_token:         process.env.TWITTER_ACCESS_TOKEN,
    access_token_secret:  process.env.TWITTER_ACCESS_TOKEN_SECRET
  });
} catch (err) {
  console.error('Sorry, your .env file does not have the correct settings in order to download tweets');
  throw err;
}

async function saveMediaFromTweets(twitterName, tweets) {
  let tweetsWithMedia = tweets.filter(tweet => tweet.extended_entities && tweet.extended_entities.media),
    newMedia = [],
    storedMedia,
    tweet,
    media;

  if (tweetsWithMedia) {
    storedMedia = await mediaStorage.getAll(twitterName);
    
    for (let tweetIndex = 0; tweetIndex < tweetsWithMedia.length; tweetIndex++) {
      tweet = tweetsWithMedia[tweetIndex];
      for (let mediaIndex = 0; mediaIndex < tweet.extended_entities.media.length; mediaIndex++) {
        media = tweet.extended_entities.media[mediaIndex];
        if (media.type === 'photo') {
          newMedia.push({
            tweetId: tweet.id_str,
            tweetUrl: tweet.url,
            tweetUserName: twitterName,
            tweetUserId: tweet.user.id,
            tweetMediaUrl: media.media_url_https,
            tweetMediaId: media.id,
            tweetCreatedAt: (new Date(tweet.created_at)).toISOString()
          });
        }
      }
    }
    
    await mediaStorage.saveAll(twitterName, storedMedia.concat(newMedia));

    return newMedia;
  }
}

async function getMedia(twitterName, paging) {
  let  sinceId = await storage.getItem(twitterName + ':since_id'),
    maxId = await storage.getItem(twitterName + ':max_id'),
    options = {
      screen_name: twitterName
    },
    timelineResponse,
    tweets,
    media = [];

  do {
    if (paging == 'max_id' && maxId) {
      options.max_id = bignum(maxId).sub(100).toString();
    } else if (paging == 'since_id' && sinceId) {
      options.since_id = bignum(sinceId).add(100).toString();
    }
    console.log('Retrieving statuses/user_timeline with options', options);
    timelineResponse = await twit.get('statuses/user_timeline', Object.assign({}, defaultTweetOptions, options));
    tweets = timelineResponse.data;
    console.log('Got', tweets.length, 'tweets');
    if (tweets && tweets.length > 0) {
      if (!sinceId || tweets[0].id > sinceId) {
        sinceId = tweets[0].id;
      }
      if (!maxId || tweets[tweets.length - 1].id < maxId) {
        maxId = tweets[tweets.length - 1].id;
      }
      media = media.concat(await saveMediaFromTweets(twitterName, tweets));
    }
  } while (tweets && tweets.length > 0);

  if (sinceId) {
    await storage.setItem(twitterName + ':since_id', sinceId);
  }

  if (maxId) {
    await storage.setItem(twitterName + ':max_id', maxId);
  }

  return media;
}

async function getOlderMedia(twitterName) {
  return await getMedia(twitterName, 'max_id');
}

async function getRecentMedia(twitterName) {
  return await getMedia(twitterName, 'since_id');
}

async function main() {
  let oldMedia,
    newMedia,
    twitterName,
    storedMedia;

  twitterName = process.env.TWITTER_ACCOUNT_TO_DOWNLOAD_FROM;
  if (twitterName) {
    storedMedia = await mediaStorage.getAll(twitterName);
    console.log(`Already have ${storedMedia.length} tracked media for ${twitterName}`);

    console.log('Ready to track media for', twitterName);
    oldMedia = await getOlderMedia(twitterName);
    newMedia = await getRecentMedia(twitterName);
    console.log('Tracking', oldMedia.length + newMedia.length, 'new media items');
  } else {
    throw Error('Unable to track media, please set ACCOUNT_TO_DOWNLOAD in your environment');
  }
}

module.exports.run = main;

if (require.main === module) {
  main();
}