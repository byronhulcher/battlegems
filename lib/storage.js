const storage = require('node-persist');

storage.initSync({
  dir: './.data/storage'
});

module.exports = storage;