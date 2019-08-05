"use strict";
Object.defineProperty(exports, "__esModule", {
  value: true
});
const fs = require('fs');
const ytdl = require("ytdl-core");
const express = require("express");
const session = require('express-session');
const FileStore = require('session-file-store')(session);
const bodyParser = require("body-parser");
const readline = require('readline');
const ffmpeg = require('fluent-ffmpeg');
//const ffmpegOnProgress = require('ffmpeg-on-progress')
const nDate = new Date().toLocaleString('en-US', {
  timeZone: 'Asia/Jakarta'
});
const dir = './tmp';
const mkdirp = require('mkdirp');
const recaptcha_secret = '6LdSg5gUAAAAAL7aiyHjXKArlkF0R7HAlA99oMYG';
const cookieParser = require('cookie-parser'); // module for parsing cookies
const request = require("request");
mkdirp(dir, function (err) {
  if (err) {
    console.log(err);
  }
});
var CryptoJS = require("crypto-js");
const dimas = {};
dimas.ip = function (req) {
  var ip = req.headers['x-forwarded-for'] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    (req.connection.socket ? req.connection.socket.remoteAddress : '127.0.0.1');
  return ip;
}
dimas.sc = function (res, name, value) {
  return res.cookie(name, value, {
    expire: new Date(Date.now() + (3600 * 1000)),
    maxAge: 600000,
    httpOnly: true
  });
}

dimas.rc = function (name) {
  return clearCookie(name);
}

dimas.gc = function (req, name) {
  return req.cookies[name];
}

dimas.c = function (url) {
  request({
    url: url,
    json: true
  }, function (error, response, body) {

    if (!error && response.statusCode === 200) {
      console.log(body) // Print the json response
    }
  })
}

dimas.salt = 'salt'; //salt
dimas.iv = '1111111111111111'; //pass salt
dimas.iterations = '999'; //iterations

//--functions
dimas.gkey = function (passphrase, salt) {
  var key = CryptoJS.PBKDF2(passphrase, salt, {
    hasher: CryptoJS.algo.SHA256,
    keySize: 64 / 8,
    iterations: dimas.iterations
  });
  return key;
}

dimas.enc = function (passphrase, plainText) {
  var key = dimas.gkey(passphrase, dimas.salt);
  var encrypted = CryptoJS.AES.encrypt(plainText, key, {
    iv: CryptoJS.enc.Utf8.parse(dimas.iv)
  });
  return encrypted.ciphertext.toString(CryptoJS.enc.Base64);
}

dimas.dec = function (passphrase, encryptedText) {
  var key = dimas.gkey(passphrase, dimas.salt);
  var decrypted = CryptoJS.AES.decrypt(encryptedText, key, {
    iv: CryptoJS.enc.Utf8.parse(dimas.iv)
  });
  return decrypted.toString(CryptoJS.enc.Utf8);
}

function getInfo(url) {
  return new Promise(function (resolve, reject) {
    ytdl.getInfo(url, function (err, info) {
      if (err) {
        reject(err);
      } else {
        resolve(info.formats.map(function (format) {
          return {
            url: format.url,
            quality: format.quality,
            quality_label: format.quality_label,
            type: format.type
          };
        }));
      }
    });
  });
}

function YouTubeGetID(url) {
  var ID = '';
  url = url.replace(/(>|<)/gi, '').split(/(vi\/|v=|\/v\/|youtu\.be\/|\/embed\/)/);
  if (url[2] !== undefined) {
    ID = url[2].split(/[^0-9a-z_\-]/i);
    ID = ID[0];
  } else {
    ID = url;
  }
  return ID;
}

function pdleft(val) {
  if (val >= 10)
    return val;
  else
    return '0' + val;
}

function currdate(set = false) {
  var d = new Date(),
    dformat = [(pdleft(d.getDate() + 1)),
    pdleft(d.getMonth()),
    d.getFullYear()
    ].reverse().join('/') + ' ' + [pdleft(d.getHours()),
    pdleft(d.getMinutes()),
    pdleft(d.getSeconds())
    ].join(':');
  console.log(dformat);
  if (!set) {
    return dformat;
  } else if (set == 'timestamp') {
    return d.getTime();
  } else if (set == 'locale') {
    return new Date().toLocaleString('en-US', {
      timeZone: 'Asia/Jakarta'
    });
  }
}

function filter_request(req, res, callback = false) {
  var cookie_ = req.query.cookie || req.query.session;
  var ref = req.headers.referer || req.headers.referrer;
  var host = req.headers.host;
  let RM = ref && ref.match(/akarmas\.com|agc\.io|about\-devices\.me|dimaslanjaka|localhost/gm);
  if (RM) {
    cb(callback);
  } else {
    if (!cookie_) {
      /*res.status(400).json({
        error: 'Unauthorized'
      });*/
      var fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl, enc = dimas.enc('dimaslanjaka', fullUrl);
      return res.redirect('https://agc.akarmas.com/verify/safelink/' + Buffer.from(enc).toString('base64'));
    } else {
      cb(callback);
    }
  }
  return;
}

function cb(callback) {
  if (typeof callback == 'function') {
    callback();
  }
}

function logging(file_mp3) {
  fs.readFile('tmp/saved.log', 'utf8', function (err, data) {
    if (err) {
      //throw err;
    };
    let obj = (err ? {} : JSON.parse(data));
    obj[file_mp3] = {
      id: file_mp3.replace(/\.\/tmp\/|\.mp3/gm, ''),
      date: currdate('locale'),
      timestamp: currdate('timestamp')
    }
    fs.writeFile('tmp/saved.log', JSON.stringify(obj, null, 2), {
      overwrite: true
    }, function (err) {
      if (err) {
        //throw err;
      };
      //console.log('It\'s saved!');
    });
  });
}

function delokey(obj, key) {
  try {
    delete obj[key];
  } catch (e) {
    obj[key] = undefined;
  }
  return obj;
}

var app = express();
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());
app.set('port', (process.env.PORT || 5000));

app.all('*', function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header('Access-Control-Allow-Credentials', true);

  next();
});

app.get('/crypto', function (request, response) {
  var q = request.query,
    str = q.str || q.q || q.s || q.string || q.enc,
    enc = dimas.enc('dimaslanjaka', str),
    dec = dimas.dec('dimaslanjaka', enc);
  console.log(enc, dec);
  response.status(200).json([str, encodeURIComponent(enc), Buffer.from(enc).toString('base64'), enc, dec]);
});

app.get('/info', function (request, response) {
  console.log([request.headers.host, 'google.com'].indexOf("localhost") > -1);
  response.status(200).json({
    request: request.headers
  });
});

app.get('/api', function (request, response) {
  filter_request(request, response);
  var url = request.query.url;
  if (!url) {
    response.status(400)
      .json({
        success: false,
        message: 'URL must be specified'
      });
    return;
  }
  getInfo(url)
    .then(function (val) {
      return response.status(200).json(val);
    })
    .catch(function (err) {
      return response.status(500).send(err);
    });
});

app.get('/mp3', function (request, response) {
  filter_request(request, response);
  var url = request.query.url;
  if (!url) {
    return response.status(400)
      .json({
        success: false,
        message: 'URL must be specified'
      });
  }

  let id = YouTubeGetID(url).toString().replace(/[\?]$/gm, '');
  let file_mp3 = `${dir}/${id}.mp3`;
  let siteurl = (request.protocol === 'https' ? 'https://' : 'http://') + request.headers.host + '/download?file=';
  logging(file_mp3);
  let start = Date.now();
  let save_bandwidth = false;

  if (!fs.existsSync(file_mp3)) {
    let stream = ytdl(id, {
      quality: 'highestaudio',
      //filter: 'audioonly',
    });
    let bitrate = request.query.bitrate ? request.query.bitrate : 128;
    ffmpeg(stream)
      .audioBitrate(bitrate)
      .on('progress', (p) => {
        readline.cursorTo(process.stdout, 0);
        process.stdout.write(`${p.targetSize} kb downloaded`);
      })
      .on('error', function (err) {
        return response.status(200).json({
          error: err.message
        });
      })
      .on('end', () => {
        return response.status(200).json({
          success: true,
          file: file_mp3.replace(/^.\/tmp\//gm, `http://${request.headers.host}/download?file=`),
          time: `${(Date.now() - start) / 1000}s`
        });
      })
      .save(file_mp3);
  } else {
    return response.status(200).json({
      success: true,
      file: file_mp3.replace(/^.\/tmp\//gm, `http://${request.headers.host}/download?file=`),
      time: `${(Date.now() - start) / 1000}s`
    });
  }
});

app.get('/download', function (request, response) {
  let sess = request.session;
  filter_request(request, response, function () {
    var file = request.query.file;
    var filename = (request.query.filename ? request.query.filename : file);
    if (!file) {
      return response.status(400)
        .json({
          success: false,
          message: 'FILE must be specified'
        });
    } else {
      if (!file.match(/tmp\//gm)) {
        file = 'tmp/' + file;
      }
      return response.download(file, filename + '.mp3', function (err) {
        if (err) {
          // Check if headers have been sent
          if (response.headersSent) {
            // You may want to log something here or do something else
          } else {
            return response.sendStatus(404); // 404, maybe 500 depending on err
          }
        }
      });
    }
  });
});

app.get('/delete', function (request, response) {
  filter_request(request, response);
  var file = request.query.file;
  if (!file || !file.match(/tmp\//gm)) {
    response.status(400)
      .json({
        success: false,
        message: 'FILE must be specified'
      });
    return;
  }
  fs.unlink(file, function (err) {
    response.status(200).json({
      file: file,
      error: (err ? true : false)
    })
  });
});

app.get('/rewrite', function (request, response) {
  var file = request.query.file;
  var content = request.query.text;
  if (!file || !content || !file.match(/tmp\//gm)) {
    response.status(400)
      .json({
        success: false,
        message: 'FILE and TEXT must be specified'
      });
    return;
  }
  if (fs.existsSync(file)) {
    fs.writeFile(file, content, {
      overwrite: false
    }, function (err) {
      response.status(200).json({
        file: file,
        error: (err ? true : false)
      });
    });
  }
  return;
});

app.get('/get_log', function (request, response) {
  fs.exists('tmp/saved.log', function (e) {
    fs.readFile('tmp/saved.log', 'utf8', function (err, data) {
      if (err) {
        throw err;
      };
      let jdata = JSON.parse(data);
      let ONE_HOUR = 60 * 60 * 1000; /* ms */
      for (var key in jdata) {
        if (((new Date) - jdata[key].timestamp) > ONE_HOUR) {
          fs.unlink(key, function (e) {
            console.log(e !== true);
          });
          jdata = delokey(jdata, key);
        }
      }
      fs.writeFile('tmp/saved.log', JSON.stringify(jdata, null, 4), {
        overwrite: false
      }, function (err) {
        //response.status(200).json({ error: (err ? true : false) });
      });
      response.status(200).json(jdata);
    });
    return;
  });
  return;
});

app.listen(app.get('port'), function () {
  console.log('Node app is running on port', app.get('port'));
});
//# sourceMappingURL=index.js.map