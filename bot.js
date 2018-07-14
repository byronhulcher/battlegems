const express = require('express'),
      tweetDownloader = require('./lib/input/download-tweets');

async function downloadOldTweets() {
  try {
    await tweetDownloader.run();
  } catch(error) {
    console.error("Unable to download tweets", error);
  }
}

async function main() {
  let app = express(),
      newStatuses = [],
      listener;

  await downloadOldTweets();
  
  app.use(express.static('public')); // serve static files like index.html http://expressjs.com/en/starter/static-files.html

  // listen for requests :)
  listener = app.listen(process.env.PORT, async function () {
    console.log('Your app is listening on port ' + listener.address().port);
  });
}

main();
