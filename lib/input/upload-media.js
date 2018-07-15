
const storage = require('../storage');

async function main() {
  let twitterName,
    storedMedia,
    mediaToUpload;

  twitterName = process.env.ACCOUNT_TO_DOWNLOAD;
  if (twitterName) {
    storedMedia = await storage.getItem(`${twitterName}:tweet_media`) || [];
    console.log(`Tracking ${storedMedia.length} media items for ${twitterName}`);
    mediaToUpload = storedMedia.filter(media => !media.amazonUrl);
    console.log(`Have ${mediaToUpload.length} media items to upload`);
  } else {
    throw Error('Unable to upload media, please set ACCOUNT_TO_DOWNLOAD in your environment');
  }
}

module.exports.run = main;

if (require.main === module) {
  main();
}