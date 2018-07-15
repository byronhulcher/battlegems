const trackMedia = require('../lib/input/track-media'),
  uploadMedia = require('../lib/input/upload-media');


async function main() {
  try {
    await trackMedia.run();
  } catch (error) {
    console.error('Unable to download media', error);
  }

  try {
    await uploadMedia.run();
  } catch (error) {
    console.error('Unable to upload media', error);
  }
}

main();