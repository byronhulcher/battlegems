
const storage = require('../storage'),
  request = require('request-promise-native'),
  AWS = require('aws-sdk'),
  s3 = new AWS.S3();

function getKey(mediaUrl, bucketName) {
  return `${bucketName}/${mediaUrl.split('/').slice(-1)[0]}`;
}

async function getExistingMediaLocation(media, bucketName) {
  let key = getKey(media.tweetMediaUrl, bucketName),
    s3Options = {
      Bucket: bucketName,
      Key   : key
    };

  result = await s3.headObject(s3Options).promise();
  return `https://${bucketName}.s3.amazonaws.com/${key}`;
}

async function uploadMedia(media, bucketName) {
  let key = getKey(media.tweetMediaUrl, bucketName),
    requestOptions = {
      uri: media.tweetMediaUrl,
      encoding: null,
      resolveWithFullResponse: true
    },
    response = await request(requestOptions),
    s3Options = {
      Bucket: bucketName,
      Key   : key,
      Body  : response.body,
      ContentType: response.headers['content-type']
    },
    result = await s3.upload(s3Options).promise();

  return result;
}

async function main() {
  let twitterName = process.env.ACCOUNT_TO_DOWNLOAD,
    bucketName = process.env.S3_BUCKET_NAME,
    storedMedia,
    mediaToUpload,
    result,
    existingMediaLocation;

  if (!twitterName) {
    throw Error('Unable to upload media, please set ACCOUNT_TO_DOWNLOAD in your environment');
  }

  if (!bucketName) {
    throw Error('Unable to upload media, please set S3_BUCKET_NAME in your environment');
  }

  storedMedia = await storage.getItem(`${twitterName}:tweet_media`) || [];
  console.log(`Tracking ${storedMedia.length} media items for ${twitterName}`);

  mediaToUpload = storedMedia.filter(media => !media.s3Url);
  console.log(`Have ${mediaToUpload.length} media items to upload`);

  for (let mediaIndex = 0; mediaIndex < storedMedia.length; mediaIndex++){
    if (storedMedia[mediaIndex].s3Url) {
      continue;
    }

    try {
      existingMediaLocation = await getExistingMediaLocation(storedMedia[mediaIndex], bucketName);
      storedMedia[mediaIndex].s3Url = existingMediaLocation;
      await storage.setItem(`${twitterName}:tweet_media`, storedMedia);
      console.log(`Media item ${storedMedia[mediaIndex].tweetMediaUrl} was already uploaded at ${existingMediaLocation}`);
    } catch (error) {}

    if (!storedMedia[mediaIndex].s3Url){
      try {
        result = await uploadMedia(storedMedia[mediaIndex], bucketName);
        storedMedia[mediaIndex].s3Url = result.Location;
        await storage.setItem(`${twitterName}:tweet_media`, storedMedia);
        console.log(`Uploaded media item ${storedMedia[mediaIndex].tweetMediaUrl} to ${result.Location}`);
      } catch (error) {
        console.error(`Unable to upload media item ${storedMedia[mediaIndex].tweetMediaUrl} to S3`);
        console.error(error);
      }
    }
  }
}

module.exports.run = main;

if (require.main === module) {
  main();
}