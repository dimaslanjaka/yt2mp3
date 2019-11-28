// Install fluent-ffmpeg before running this!
const PromiseFtp = require('promise-ftp');
const readline = require('readline');
const path = require('path');
const fs = require('fs');
const ytdl = require('ytdl-core');
const ffmpeg = require('fluent-ffmpeg');
const express = require("express");
const receiver = 'https://agcontents.000webhostapp.com/receiver.php';
const session = require('express-session');
const REQUEST = require('request');
const mkdirp = require('mkdirp');
const { google } = require('googleapis');
const sampleClient = require('./googlejs');
const util = require('util');
const CLIENT_ID = '439429450847-2r1oa7oj8r0hghopmaasi1brdbc3f2vj.apps.googleusercontent.com';
const CLIENT_SECRET = 'mk0QC76LGxW5G7JNe-oQUXW2';
const apikey = 'AIzaSyBYr0oEXIBLNXg4otQXfFO5fnomPQsDx4I';
const ftpConfig = { host: 'ftpupload.net', user: 'frsiv_24855722', password: 'A82wekhu7RGsC@M' };
//create folder
mkdirp('./tmp', function (err) {
  if (err) {
    console.log(err);
  }
});

function gc() {
  let oauth2Client = new google.auth.OAuth2(
    '439429450847-2r1oa7oj8r0hghopmaasi1brdbc3f2vj.apps.googleusercontent.com'.trim(),
    'mk0QC76LGxW5G7JNe-oQUXW2'.trim(),
    'http://127.0.0.1:5000/callback'.trim()
  );
  oauth2Client.on('tokens', (tokens) => {
    if (tokens.refresh_token) {
      // store the refresh_token in my database!
      console.log({ 'refreshToken': tokens.refresh_token });
      oauth2Client.setCredentials({
        refresh_token: tokens.refresh_token
      });
    }
    console.log({ 'accessToken': tokens.access_token });
  });
  return oauth2Client;
}

function pp(oauth2Client) {
  return google.people({
    version: 'v1',
    auth: oauth2Client,
  });
}

async function saveToken(oauth2Client, tokendata = null) {
  try {
    let people = pp(oauth2Client);
    let ppl = await people.people.get({
      resourceName: 'people/me',
      personFields: 'emailAddresses,names,photos',
    });
    if (ppl.data.emailAddresses[0].value) {
      tokenfile = `./tmp/${ppl.data.emailAddresses[0].value}.token.json`;
      datafile = `./tmp/${ppl.data.emailAddresses[0].value}.data.json`;
    } else {
      tokenfile = "./tmp/token.json";
      datafile = "./tmp/data.json";
    }
    fs.writeFile(datafile, JSON.stringify(ppl.data), function (err) {

      if (err) {
        return console.log(err);
      }
    });
    if (tokendata) {
      fs.writeFile(tokenfile, JSON.stringify(tokendata), function (err) {

        if (err) {
          return console.log(err);
        }
      });
    }
  } catch (error) {
    console.log(error);
  }
}

function fixname(str) {
  return str.replace(/[^\w\s]/gi, '-').replace(/\-{2,100}/gm, '-');
}

//start server
var app = express();
app.use(session({
  secret: 'your-random-secret-19890913007',
  resave: true,
  saveUninitialized: true,
}));

app.set('port', (process.env.PORT || 5000));

app.all('*', function (req, res, next) {
  let fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
  res.header("Access-Control-Allow-Origin", "*");
  res.header('Access-Control-Allow-Credentials', true);
  console.log(fullUrl);

  next();
});

app.get("/login", function (request, response) {
  url_redirect = gc().generateAuthUrl({
    'access_type': 'offline',
    'prompt': 'consent',
    'scope': [
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/drive',
      'https://www.googleapis.com/auth/youtube'
    ]
  });
  if (request.query.email) {
    url_redirect = '/auth?email=' + trim(decodeURIComponent(request.query.email));
  }
  response.writeHead(301,
    { Location: url_redirect }
  );
  response.end();
});

app.get('/callback', async (request, response) => {
  let tokenfile, datafile;
  if (request.query.code) {
    res = response;
    res.setHeader('Content-Type', 'text/html');
    try {
      let oauth2Client = gc();
      let data = await oauth2Client.getToken(decodeURIComponent(request.query.code));
      if (data.tokens) {
        oauth2Client.setCredentials(data.tokens);
        saveToken(oauth2Client, data);
      }
    } catch (error) {
      console.log(error);
    }
  }
});

app.get('/auth', async (request, response) => {
  if (request.query.email) {
    try {
      let readFile = util.promisify(fs.readFile);
      let email = decodeURIComponent(request.query.email).trim();
      let tokenfile = `./tmp/${email}.token.json`;
      let tokenjson = readFile(tokenfile, 'utf8');//JSON.parse(readFile(tokenfile, 'utf8'));
      let oauth2Client = gc();
      tokenjson.then(function (token) {
        let data = JSON.parse(token);
        if (data.tokens) {
          oauth2Client.setCredentials(data.tokens);
          saveToken(oauth2Client, data);
        }
      });
      request.session.email = email;
      request.session.token = tokenjson;
      request.session.tokenfile = tokenfile;
    } catch (error) {
      console.log(error);
    }
  }
});

app.get("/mp3", function (request, http_response) {
  if (request.query.id) {
    let size;
    let id = decodeURIComponent(request.query.id).trim();
    let file_mp3 = `./tmp/${id}.mp3`;
    let start = Date.now();
    let stream = ytdl(id, {
      quality: 'highestaudio',
      //filter: 'audioonly',
    });
    let bitrate = request.query.bitrate ? request.query.bitrate : 320;
    REQUEST(`${host}/ftp/list?file=${id}.json`, function (error, res, body) {
      if (typeof body == 'string') {
        body = JSON.parse(body);
      }
      if (typeof body.error == 'undefined') {
        REQUEST(`http://dimaslanjaka.freesite.vip/${id}.json`, function (err, res, body) {
          if (typeof body == 'string') {
            body = JSON.parse(body);
          }
          if (body.items[0].snippet.title) {
            return http_response.status(200).json({
              'file': `http://dimaslanjaka.freesite.vip/${body.items[0].snippet.title}.mp3`
            });
          }
        });
      }
      ffmpeg(stream)
        .audioBitrate(bitrate)
        .on('progress', (p) => {
          size = p.targetSize;
          readline.cursorTo(process.stdout, 0);
          process.stdout.write(size + ' Kb');
          REQUEST(receiver + '?content=' + size + '&filename=' + id + '&dir=youtube&force');
        })
        .on('error', function (err) {
          return http_response.status(200).json({
            error: err.message
          });
        })
        .on('end', () => {
          let info;
          let id = decodeURIComponent(request.query.id).trim();
          let host = request.protocol + '://' + request.get('host');
          let jsoninfo = `./tmp/${id}.json`;
          REQUEST(`https://www.googleapis.com/youtube/v3/videos?part=id,snippet,statistics,contentDetails&id=${id}&key=AIzaSyDnemEYJkjnqgXlXOTbB71I2SBO8O5OIDY`, function (error, res, body) {
            if (typeof body == 'string') {
              body = JSON.parse(body);
            }
            if (body.items[0].snippet.title) {
              body.items[0].snippet.title = fixname(body.items[0].snippet.title);
            }
            fs.writeFile(jsoninfo, JSON.stringify(body), function (err) {
              if (err) {
                return console.log(err);
              }
              if (typeof body == 'string') {
                info = JSON.parse(body);
                if (typeof info == 'string') {
                  info = JSON.parse(info);
                }
              } else {
                info = body;
              }
              if (typeof info.items[0].snippet.title != 'undefined') {
                rename = './tmp/' + info.items[0].snippet.title + '.mp3';
                fs.rename(file_mp3, rename, function (err) {
                  //if (err) throw err;
                });
                file_mp3 = fixname(rename)
              }
              REQUEST(`${host}/ftp/upload?filename=${jsoninfo}`, function (error, res, body) {
                fs.unlink(jsoninfo, (err) => {
                  //if (err) throw err;
                });
                REQUEST(`${host}/ftp/upload?filename=${file_mp3}`, function (error, res, body) {
                  fs.unlink(file_mp3, (err) => {
                    //if (err) throw err;
                  });
                  http_response.writeHead(200, { 'Content-Type': 'application/json' });
                  http_response.write(JSON.stringify({
                    success: true,
                    file: file_mp3.replace(/^.\/tmp\//gm, `http://dimaslanjaka.freesite.vip/`),
                    time: `${(Date.now() - start) / 1000}s`,
                    'size': size
                  }));
                  http_response.end();
                });
              });
            });
          });
        })
        .save(file_mp3);
    });
  }
});

//FTP handling
app.get('/ftp/list', function (request, response) {
  let ftp = new PromiseFtp();
  ftp.connect(ftpConfig)
    .then(function (serverMessage) {
      return ftp.list('/htdocs/', false);
    }).then(function (list) {
      ftp.end();
      let dir = [];
      let files = [];
      list.forEach(function (file) {
        if (file.type == '-') {
          files.push(file);
        } else {
          dir.push(file);
        }
      });
      if (request.query.file) {
        let errors = true, i = 0;
        let filename = decodeURIComponent(request.query.file).trim();
        files.forEach(function (file) {
          i++;
          if (file.name == filename) {
            errors = false;
            file.success = true;
            file.exists = true;
            return response.status(200).json(file);
          } else if(i >= files.length && errors === true && response.headersSent === false){
            return response.status(200).json({ 'error': `file ${request.query.file} not exists` });
          }
        })
      } else {
        return response.status(200).json({ 'directory': dir, 'files': files });
      }
    });
});

app.get('/ftp/upload', function (request, response) {
  let filename;
  let ftp = new PromiseFtp();
  ftp.connect(ftpConfig)
    .then(function (serverMessage) {
      if (request.query.filename) {
        filename = decodeURIComponent(request.query.filename).trim().replace(/^.\/tmp\//gm, '');
      } else {
        filename = 'saved.log';
      }
      return ftp.put('./tmp/' + filename, '/htdocs/' + filename);
    }).then(function (list) {
      ftp.end();
      response.writeHead(301,
        { Location: '/ftp/list' }
      );
      response.end();
    });
});

app.listen(app.get('port'), function () {
  console.log('Node app is running on port', app.get('port'));
});