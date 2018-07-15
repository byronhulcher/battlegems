const del = require('del'),
  storage = require('node-persist');

async function deleteStorageData() {
  await storage.init({
    dir: './.data/storage'
  });
  await storage.clear();
}

async function deleteFileData() {
  await del('.data/*.txt');
}

function inFiveSeconds() {
  return new Promise( (resolve) => {
    setTimeout(function () {
      resolve();
    }, 5000);
  });
}

async function main() {
  console.log('Clearing data in 5 seconds...');
  await inFiveSeconds();
  await deleteFileData();
  await deleteStorageData();
  console.log('Data is cleared!');
}

main();