const fs = require('fs');
const request     = require('miniget');
const m3u8stream  = require('m3u8stream');
const parseTime   = require('m3u8stream/lib/parse-time');
const http        = require('http');
const https       = require('https');
const ytdl = require("ytdl-core");
const express = require("express");
const session = require('express-session');
//const FileStore = require('session-file-store')(session);
const bodyParser = require("body-parser");
const readline = require('readline');
const ffmpeg = require('fluent-ffmpeg');
//const ffmpegOnProgress = require('ffmpeg-on-progress')
const dir = './tmp';
const mkdirp = require('mkdirp');
//const recaptcha_secret = '6LdSg5gUAAAAAL7aiyHjXKArlkF0R7HAlA99oMYG';
//const cookieParser = require('cookie-parser'); // module for parsing cookies
//const request = require("request");
mkdirp(dir, function (err) {
  if (err) {
    console.log(err);
  }
});

const {google} = require('googleapis');

const oauth2Client = new google.auth.OAuth2(
  '439429450847-2r1oa7oj8r0hghopmaasi1brdbc3f2vj.apps.googleusercontent.com'.trim(),
  'mk0QC76LGxW5G7JNe-oQUXW2'.trim(),
  'http://127.0.0.1:5000/'
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


var app = express();
/*
app.use(bodyParser.urlencoded({
  extended: true
}));
*/
app.use(Session({
  secret: 'your-random-secret-19890913007',
  resave: true,
  saveUninitialized: true
}));
app.use(bodyParser.json());
app.set('port', (process.env.PORT || 5000));

app.all('*', function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header('Access-Control-Allow-Credentials', true);

  next();
});

app.use("/", function (req, res) {
  res.send(`
      &lt;h1&gt;Authentication using google oAuth&lt;/h1&gt;
      &lt;a href=${url_redirect}&gt;Login&lt;/a&gt;
  `)
});