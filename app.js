const express = require('express');

let app = express(),
  listener;

app.use(express.static('public')); // serve static files like index.html http://expressjs.com/en/starter/static-files.html

// listen for requests :)
listener = app.listen(process.env.PORT, async function () {
  console.log('Your app is listening on port ' + listener.address().port);
});