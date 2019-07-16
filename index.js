"use strict";
Object.defineProperty(exports, "__esModule", {
  value: true
});
const fs = require('fs');
const ytdl = require("ytdl-core");
const express = require("express");
const bodyParser = require("body-parser");
const readline = require('readline');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegOnProgress = require('ffmpeg-on-progress')

var dir = './tmp';
var mkdirp = require('mkdirp');
mkdirp(dir, function (err) {
  if (err) {
    console.log(err);
  }
});

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

function urlparam(name, url) {
  name = name.replace(/[\[\]]/g, '\\$&');
  var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
    results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

function YouTubeGetID(url) {
  var ID = '';
  url = url.replace(/(>|<)/gi, '').split(/(vi\/|v=|\/v\/|youtu\.be\/|\/embed\/)/);
  if (url[2] !== undefined) {
    ID = url[2].split(/[^0-9a-z_\-]/i);
    ID = ID[0];
  }
  else {
    ID = url;
  }
  return ID;
}

var app = express();
app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(bodyParser.json());
app.set('port', (process.env.PORT || 5000));
app.get('/api', function (request, response) {
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
  var url = request.query.url;
  if (!url) {
    response.status(400)
      .json({
        success: false,
        message: 'URL must be specified'
      });
    return;
  }
  let id = YouTubeGetID(url);

  let stream = ytdl(id, {
    quality: 'highestaudio',
    //filter: 'audioonly',
  });
  let file_mp3 = `${dir}/${id}.mp3`;

  let start = Date.now();
  ffmpeg(stream)
    .audioBitrate(128)
    .save(file_mp3)
    .on('progress', (p) => {
      readline.cursorTo(process.stdout, 0);
      process.stdout.write(`${p.targetSize} kb downloaded`);
    })
    .on('end', () => {
      response.status(200).json({
        success: true,
        file: file_mp3,
        time: `${(Date.now() - start) / 1000}s`
      });
    });
});

app.get('/download', function (request, response) {
  var file = request.query.file;
  if (!file) {
    response.status(400)
      .json({
        success: false,
        message: 'URL must be specified'
      });
    return;
  }
  if (fs.existsSync(path)) {
    response.download(file, function(err) {
      if (err){
        console.log(err);
      }
      fs.unlink(file);
    });
  } else {
    response.status(200).json({error: `${file} doesnt exists`});
  }
});

app.listen(app.get('port'), function () {
  console.log('Node app is running on port', app.get('port'));
});
//# sourceMappingURL=index.js.map