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
const nDate = new Date().toLocaleString('en-US', {
  timeZone: 'Asia/Jakarta'
});
const dir = './tmp';
const mkdirp = require('mkdirp');
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

function filter_request(req, res) {
  var ref = req.headers.referer;
  var host = req.headers.host;
  if (host != 'localhost:5000') {
    if (!ref || !get_hostname(ref).match(/about\-devices|akarmas\.com/gm)) {
      res.status(400)
        .json({
          success: false,
          message: 'Invalid Headers [R]'
        });
      return;
    }
  }
}

function get_hostname(url) {
  var hostname;
  //find & remove protocol (http, ftp, etc.) and get hostname

  if (url.indexOf("//") > -1) {
    hostname = url.split('/')[2];
  } else {
    hostname = url.split('/')[0];
  }

  //find & remove port number
  hostname = hostname.split(':')[0];
  //find & remove "?"
  hostname = hostname.split('?')[0];

  return hostname;
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
    response.status(400)
      .json({
        success: false,
        message: 'URL must be specified'
      });
    return;
  }

  let id = YouTubeGetID(url);
  let file_mp3 = `${dir}/${id}.mp3`;
  logging(file_mp3);
  let start = Date.now();

  if (request.headers.host != 'localhost:5000') {
    if (!fs.existsSync(file_mp3)) {
      let stream = ytdl(id, {
        quality: 'highestaudio',
        //filter: 'audioonly',
      });
      ffmpeg(stream)
        .audioBitrate(128)
        .on('progress', (p) => {
          readline.cursorTo(process.stdout, 0);
          process.stdout.write(`${p.targetSize} kb downloaded`);
        })
        .on('error', function (err) {
          response.status(200).json({
            error: err.message
          });
        })
        .on('end', () => {
          response.status(200).json({
            success: true,
            file: file_mp3.replace(/^.\/tmp\//gm, '/download?file='),
            time: `${(Date.now() - start) / 1000}s`
          });
        })
        .save(file_mp3);
    } else {
      response.status(200).json({
        success: true,
        file: file_mp3.replace(/^.\/tmp\//gm, '/download?file='),
        time: `${(Date.now() - start) / 1000}s`
      });
    }
  } else {
    fs.writeFile(file_mp3, '', {
      overwrite: true
    }, function (err) {
      if (err) {
        //throw err;
      };
      response.status(200).json({
        success: true,
        file: file_mp3.replace(/^.\/tmp\//gm, '/download?file='),
        time: `${(Date.now() - start) / 1000}s`
      });
    });
  }
});

app.get('/download', function (request, response) {
  filter_request(request, response);
  var file = request.query.file;
  if (!file) {
    response.status(400)
      .json({
        success: false,
        message: 'URL must be specified'
      });
    return;
  }
  if (fs.existsSync(file)) {
    response.download(file, function (err) {
      if (err) {
        console.log(err);
      }
      fs.unlink(file);
    });
  } else {
    response.status(200).json({
      error: `file: ${file} doesnt exists`
    });
  }
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
    response.status(200).json({ file: file, error: (err ? true : false) })
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
      response.status(200).json({ file: file, error: (err ? true : false) });
    });
  }
  return;
});

app.get('/get_log', function (request, response) {
  fs.exists('tmp/saved.log', function(e){
    fs.readFile('tmp/saved.log', 'utf8', function (err, data) {
      if (err) {
        throw err;
      };
      let jdata = JSON.parse(data);
      let ONE_HOUR = 60 * 60 * 1000; /* ms */
      for (var key in jdata) {
        if (((new Date) - jdata[key].timestamp) > ONE_HOUR) {
          fs.unlink(key, function(e){
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