const express = require('express'),
      storage = require('./lib/storage');

let app = express(),
  listener;

app.use(express.static('public')); // serve static files like index.html http://expressjs.com/en/starter/static-files.html
app.use(express.json());

app.get('/', async function (req, res) {
  let media = await storage.getItem(`${process.env.ACCOUNT_TO_DOWNLOAD}:tweet_media`) || [];
  res.setHeader('Content-Type', 'application/json');
  res.send(JSON.stringify(media));
});

// listen for requests :)
listener = app.listen(process.env.PORT, async function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
