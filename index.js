// Install fluent-ffmpeg before running this!

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

//create tmp
mkdirp('./tmp', function (err) {
  if (err) {
    console.log(err);
  }
});

//google init
const oauth2Client = new google.auth.OAuth2(
  '439429450847-2r1oa7oj8r0hghopmaasi1brdbc3f2vj.apps.googleusercontent.com'.trim(),
  'mk0QC76LGxW5G7JNe-oQUXW2'.trim(),
  'http://127.0.0.1:5000/callback'
);

// generate a url that asks permissions for Blogger and Google Calendar scopes
const scopes = [
  'https://www.googleapis.com/auth/blogger',
  'https://www.googleapis.com/auth/drive',
  'https://www.googleapis.com/auth/youtube',
  'https://www.googleapis.com/auth/userinfo.profile',
  'https://www.googleapis.com/auth/userinfo.email'
];

const url_redirect = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: scopes
});

//start server
var app = express();
app.use(session({
  secret: 'your-random-secret-19890913007',
  resave: true,
  saveUninitialized: true
}));

app.set('port', (process.env.PORT || 5000));

app.all('*', function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header('Access-Control-Allow-Credentials', true);

  next();
});

app.get("/login", function (request, response) {
  response.writeHead(301,
    { Location: url_redirect }
  );
  response.end();
});

app.get('/callback', function (request, response) {
  const data = oauth2Client.getToken(request.query.code);
  oauth2Client.setCredentials(data.tokens);
  fs.writeFile("./tmp/token", JSON.stringify(data), function (err) {

    if (err) {
      return console.log(err);
    }

    response.status(200).json({ 'success': "The token was saved!" });
  });
});

app.get("/mp3", function (request, response) {
  if (request.query.id) {
    let id = request.query.id;
    let file_mp3 = './tmp/' + id + '.mp3';
    let start = Date.now();
    let stream = ytdl(request.query.id, {
      quality: 'highestaudio',
      //filter: 'audioonly',
    });
    let bitrate = request.query.bitrate ? request.query.bitrate : 320;
    ffmpeg(stream)
      .audioBitrate(bitrate)
      .on('progress', (p) => {
        readline.cursorTo(process.stdout, 0);
        process.stdout.write(p.targetSize + ' Kb');
        REQUEST.get({
          headers: {},
          url: receiver + '?content=' + p.targetSize + '&filename=' + id + '&dir=youtube&force'
        }, function (error, responseCode, body) {
          //console.log(responseCode.statusCode);
        });
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
  }
});


app.listen(app.get('port'), function () {
  console.log('Node app is running on port', app.get('port'));
});