const path = require('path'),
  express = require('express'),
  mediaStorage = require('./lib/media');

let app = express(),
  listener;

app.use(express.static('public')); // serve static files like index.html http://expressjs.com/en/starter/static-files.html
app.use(express.json());

// http://expressjs.com/en/starter/basic-routing.html
app.get('/', function (request, response) {
  response.sendFile(path.join(__dirname, '/pages/index.html'));
});

app.get('/media/', async function (req, res) {
  let media = await mediaStorage.getAllCached(process.env.TWITTER_ACCOUNT_TO_DOWNLOAD_FROM);

  res.setHeader('Content-Type', 'application/json');
  res.send(JSON.stringify(media));
});

// listen for requests :)
listener = app.listen(process.env.PORT, async function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
