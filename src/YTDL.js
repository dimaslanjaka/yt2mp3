const fs = require("fs");
const ytdl = require("ytdl-core");
const path = require("path");
const getDirName = require("path").dirname;
const ffmpeg = require("fluent-ffmpeg");
const readline = require("readline");
const axios = require("axios");
const process = require("process");
const ROOT = process.cwd();
const is = require("./is");
const tmp = path.join(ROOT, "tmp");
const moment = require("moment");
const resolve = require("./resolve");

if (typeof localStorage === "undefined" || localStorage === null) {
  var LocalStorage = require("node-localstorage").LocalStorage;
  //localStorage = new LocalStorage('./scratch');
  global.localStorage = new LocalStorage(ROOT + "/tmp");
}

//const url = "https://youtu.be/cr9NEWOjuEg";
/**
 * Youtube downloader core
 * @author Dimas Lanjaka
 */
class YTDL {
  /**
   * API KEY GOOGLE
   * @type {string}
   */
  API_KEY;
  API_URL = "https://www.googleapis.com/youtube/v3/search";

  /**
   * Set API Key
   * @param {string} api
   */
  key(api) {
    this.API_KEY = api;
  }

  /**
   * Get youtube id from url
   * @param {string} url
   */
  getID(url) {
    return YouTubeGetID(url);
  }

  /**
   * Get Blocked Keys
   * @author Dimas Lanjaka
   */
  getBlockedKeys() {
    /**
     * get blocked keys
     */
    const blockedKeys = localStorage.getItem("blockedKeys");
    let dump;
    if (blockedKeys) {
      dump = JSON.parse(blockedKeys);
    } else {
      dump = {};
    }

    let lists = Object.keys(dump);
    if (!lists || !lists.length) {
      lists = [];
    }
    return {
      keys: lists,
      dump: dump,
    };
  }

  /**
   * Start Fetch MP3
   * @param {string} url
   */
  async start(url, bitrate, callback) {
    const VideoID = YouTubeGetID(url);
    let info = await ytdl.getInfo(VideoID);
    let audioFormats = ytdl.filterFormats(info.formats, "audioonly");
    //console.log("Video length: " + info.length_seconds);
    //console.log("Formats with only audio: " + audioFormats.length);
    resolve.dir(tmp + "/mp3");
    resolve.dir(tmp + "/info");
    writeFile(
      path.join(tmp, "info", VideoID + ".json"),
      JSON.stringify(info, null, 2)
    );

    if (audioFormats.length) {
      this.downloadMp3(VideoID, bitrate, callback);
    }
  }

  log = {
    /**
     * Folder process
     */
    process: path.join(tmp, "process"),
    /**
     * Folder success
     */
    success: path.join(tmp, "success"),
  };

  /**
   * Download MP3
   * @param {string} VideoID
   * @param {number} bitrate
   * @param {function("progress"|"error"|"success", any)} callback
   */
  downloadMp3(VideoID, bitrate, callback) {
    if (typeof callback != "function") {
      callback = function () {};
    }
    if (typeof bitrate == "function") {
      callback = bitrate;
    }
    const logsuccess = path.join(this.log.success, VideoID + ".json");
    const logprocess = path.join(this.log.process, VideoID + ".json");
    const file_mp3 = path.join(ROOT, "tmp/mp3", VideoID + ".mp3");
    writeFile(file_mp3);
    let stream = ytdl(VideoID, {
      quality: "highestaudio",
      //filter: 'audioonly',
    });
    if (!bitrate || typeof bitrate != "number") {
      bitrate = 128;
    }
    //set log readline to 0
    readline.cursorTo(process.stdout, 0);

    ffmpeg(stream)
      .audioBitrate(bitrate)
      .on("progress", (p) => {
        process.stdout.write(`${p.targetSize} kb downloaded`);
        callback("progress", p.targetSize);
        writeFile(logprocess, p);
      })
      .on("error", function (err) {
        console.log(err);
        callback("error", err);
      })
      .on("end", () => {
        process.stdout.write("success saved to " + file_mp3);
        callback("success", file_mp3);

        const log = readFile(logsuccess) || {};
        log[file_mp3] = {
          expire: moment(new Date()).add(5, "m").toDate(),
          url: "/download?id=" + VideoID,
        };
        writeFile(logsuccess, log);
        writeFile(logprocess, { status: "success" });
      })
      .save(file_mp3);
  }

  API_PARAMS = {};

  /**
   * Search youtube videos
   * @param {string} query
   * @param {string|function(boolean,array,object)} pageToken pageToken result (Pagination API) or callback
   * @param {function(boolean,array,object)} callback
   * @example search('remix', function(error, items, response){
   * console.log(error, items, response);
   * if (error){
   * //error codes
   * }
   * });
   */
  search(query, pageToken, callback) {
    //pageToken is callback not string
    if (typeof pageToken == "function") {
      callback = pageToken;
    }
    const API_KEY = this.API_KEY;
    const API_URL = this.API_URL;
    const params = {
      part: "snippet",
      key: API_KEY,
      q: query,
      type: "video",
      maxResults: 10,
      order: "viewCount",
    };
    if (typeof pageToken == "string") {
      params.pageToken = pageToken;
    }
    //console.log(params);
    this.API_PARAMS = params;

    return axios
      .get(API_URL, { params: params })
      .then(function (response) {
        if (callback) {
          callback(false, response.data.items, response);
          writeFile(
            path.join(
              ROOT,
              "tmp/info/search/",
              query + (token ? "-" + token : "") + ".json".trim()
            ),
            response.data
          );
        }
      })
      .catch(function (error) {
        //console.error(error);
        if (error.hasOwnProperty("data")) {
          const msg = error.data.error.message;
          const code = error.data.error.code;
          //console.log(`error (${code}) ${msg} API: ${this.API_KEY}`);
          blockedKeys[API_KEY] = code;
          if (code == 403) {
            console.error("blocking " + API_KEY);
            localStorage.setItem("blockedKeys", JSON.stringify(blockedKeys));
          }
          callback(
            new Error(
              "Error Code: " + code + ", Message: " + msg + ", API: " + API_KEY
            ),
            code,
            msg
          );
        }
      });
  }
}

/**
 * Get youtube ID from url
 * @param {string} url
 */
function YouTubeGetID(url) {
  var ID = "";
  url = url
    .replace(/(>|<)/gi, "")
    .split(/(vi\/|v=|\/v\/|youtu\.be\/|\/embed\/)/);
  if (url[2] !== undefined) {
    ID = url[2].split(/[^0-9a-z_\-]/i);
    ID = ID[0];
  } else {
    ID = url;
  }
  console.log(getFuncName(), ID);
  return ID;
}

/**
 * Get function name
 */
function getFuncName() {
  return getFuncName.caller.name;
}

const mkdirp = require("mkdirp");
const { dirname } = require("path");

/**
 * Write file recursive
 * @param {string} path
 * @param {any} contents?
 * @param {any} cb? callback of fs.writeFile
 */
function writeFile(path, contents, cb) {
  if (!cb) {
    cb = function () {};
  }
  //console.log(path);
  fs.mkdirSync(getDirName(path), { recursive: true });
  mkdirp(getDirName(path), function (err) {
    if (err) return cb(err);
    // if contents exists
    if (contents) {
      //console.log(typeof contents);
      if (typeof contents == "object" || Array.isArray(contents)) {
        contents = JSON.stringify(contents, null, 2);
      }
      fs.writeFile(path, contents, cb);
    }
  });
}

/**
 * Read file (Sync)
 * @param {string} path
 */
function readFile(path) {
  if (!fs.existsSync(dirname(path))) {
    fs.mkdirSync(dirname(path), { recursive: true });
  }
  if (fs.existsSync(path)) {
    const read = fs.readFileSync(path).toString();
    if (is.json(read.trim())) {
      return JSON.parse(read.trim());
    }
    return read;
  }
  return null;
}

module.exports = {
  YTDL: YTDL,
  writeFile: writeFile,
  path: path,
  getYtID: YouTubeGetID,
  root: ROOT,
  is: is,
};
