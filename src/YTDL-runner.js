const YTDL = require('./YTDL');

/**
 * API KEY List
 */
let apis = [
  'AIzaSyDm21ZMgT6KQpjo3T0BFVH3DjhykYU5bXM',
  'AIzaSyDjF63RkbOTm-n3gJ-a-hBwXt7EFW851vA',
  'AIzaSyDlna9xQsXvsCK5oUKAsYozuk5YHczAyS0'
];

const yt = new YTDL.YTDL();
//remove blocked keys from key lists
apis = apis.filter(function (el) {
  return !yt.getBlockedKeys().keys.includes(el);
});

/**
 * get random api
 */
const API_KEY = apis[Math.floor(Math.random() * apis.length)];
//set key api
yt.key(API_KEY);
/**
 * //search start
var query = "remix";
yt.search(query, function (error, items, response) {
  if (error) {
    console.log(error);
  } else {
    YTDL.writeFile(
      YTDL.path.join(__dirname, "tmp/info/search/", query + ".json"),
      response.data
    );
  }
});
 */

module.exports = yt;
