const storage = require('./storage'),
  CACHE_LIMIT = 60 * 60; // one hour in seconds

let cachedMedia,
  lastCacheRefresh;

module.exports.getAll = async (twitterName) => {
  return await storage.getItem(twitterName + ':tweet_media') || [];
};

module.exports.getAllCached = async (twitterName) => {
  if (typeof cachedMedia === 'undefined' || typeof lastCacheRefresh === 'undefined' || Date.now() > lastCacheRefresh + CACHE_LIMIT) {
    cachedMedia = await storage.getItem(twitterName + ':tweet_media') || [];
  }
  return cachedMedia;
};

module.exports.saveAll = async (twitterName, media) => {
  await storage.setItem(twitterName + ':tweet_media', media);
  return media;
};



