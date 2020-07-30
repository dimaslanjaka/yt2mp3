function gc() {
  let oauth2Client = new google.auth.OAuth2(
    '439429450847-2r1oa7oj8r0hghopmaasi1brdbc3f2vj.apps.googleusercontent.com'.trim(),
    'mk0QC76LGxW5G7JNe-oQUXW2'.trim(),
    'http://127.0.0.1:5000/callback'.trim()
  );
  oauth2Client.on('tokens', (tokens) => {
    if (tokens.refresh_token) {
      // store the refresh_token in my database!
      console.log({
        'refreshToken': tokens.refresh_token
      });
      oauth2Client.setCredentials({
        refresh_token: tokens.refresh_token
      });
    }
    console.log({
      'accessToken': tokens.access_token
    });
  });
  return oauth2Client;
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
  str = str.replace(/\s+/gm, '-');
  str = str.replace(/[^\w\s]/gi, '-');
  str = str.replace(/\-{2,100}/gm, '-');
  str = str.replace(/\-mp3$/gm, '.mp3');
  str = str.replace(/\-\.mp3$/gm, '.mp3');
  str = str.replace(/^.\/tmp\/|\-tmp\-/gm, '');
  str = str.replace(/\-json$/gm, '.json');
  str = str.replace('- -', ' - ');
  str = str.trim();
  return str;
}

function ftp_upload(filename, delete_file = true, callback = false) {
  if (!filename.match(/json$/gm)) {
    filename = fixname(decodeURIComponent(filename));
  }
  filename = filename.replace(/^\.\/tmp\//gm, '');
  console.log(`Uploading ${filename}`);
  let ftp = new PromiseFtp();
  ftp.connect(ftpConfig)
    .then(function (serverMessage) {
      ftp.put('./tmp/' + filename, '/htdocs/' + filename);
    }).then(function (list) {
      ftp.end();
      if (delete_file === true) {
        fs.unlink('./tmp/' + filename, (err) => {
          //if (err) throw err;
        });
      }
      if (typeof callback != 'boolean') {
        callback();
      }
    });
}

function reauth(request) {
  if (request.query.email) {
    try {
      let readFile = util.promisify(fs.readFile);
      let email = decodeURIComponent(request.query.email).trim();
      let tokenfile = `./tmp/${email}.token.json`;
      let tokenjson = readFile(tokenfile, 'utf8'); //JSON.parse(readFile(tokenfile, 'utf8'));
      let oauth2Client = gc();
      tokenjson.then(function (token) {
        let data = JSON.parse(token);
        if (typeof data == 'string') {
          data = JSON.parse(data);
        }
        console.log({ 'offline': data });
        if (data.tokens) {
          oauth2Client.setCredentials(data.tokens);
          // after acquiring an oAuth2Client...
          //const tokenInfo = await oAuth2Client.getTokenInfo(data.tokens.access_token);

          // take a look at the scopes originally provisioned for the access token
          //console.log({'tokenInfo': tokenInfo.scopes});
          saveToken(oauth2Client, data);
          return oauth2Client;
        }
      });
      request.session.email = email;
      request.session.token = tokenjson;
      request.session.tokenfile = tokenfile;
    } catch (error) {
      console.log(error);
    }
  }
}

module.exports = function(app){
  app.all('*', function (req, res, next) {
    let fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
    res.header("Access-Control-Allow-Origin", "*");
    res.header('Access-Control-Allow-Credentials', true);
    console.log(fullUrl);

    next();
  });

  app.get("/g-login", function (request, response) {
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
    response.writeHead(301, {
      Location: url_redirect
    });
    response.end();
  });

  app.get('/g-callback', async (request, response) => {
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

  app.get('/api', function (request, response) {
    var url = decodeURIComponent(request.query.url).trim();
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

  app.get('/auth', async (request, response) => {
    try {
      let people = pp(reauth(request));
      let data = await people.people.get({
        resourceName: 'people/me',
        personFields: 'emailAddresses,names,photos',
      });
      console.log(data);
    } catch (error) {

    }
  });

  app.get('/drive/list', async (request, response) => {
    try {
      let drive = google.drive({
        version: 'v3',
        auth: reauth(request),
      });
      let res = await drive.files.list(params);
      console.log(res.data);
    } catch (error) {

    }
  });

  app.get("/mp3", function (request, http_response) {
    if (request.query.id) {
      let size, title;
      let host = request.protocol + '://' + request.get('host');
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
        //console.log(body);
        if (typeof body.error == 'undefined' && typeof request.query.redownload == 'undefined') {
          REQUEST(`https://www.googleapis.com/youtube/v3/videos?part=id,snippet,statistics,contentDetails&id=${id}&key=AIzaSyDnemEYJkjnqgXlXOTbB71I2SBO8O5OIDY`, function (error, res, body) {
            if (typeof body == 'string') {
              body = JSON.parse(body);
            }
            if (body.items[0].snippet.title) {
              title = fixname(body.items[0].snippet.title);
              return http_response.status(200).json({
                'file': `http://dimaslanjaka.freesite.vip/${title}.mp3`
              });
            }
          });
        } else {
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
                  /*
                  ftp_upload(jsoninfo, true, function () {
                    ftp_upload(file_mp3, true, function () {
                      http_response.writeHead(200, {
                        'Content-Type': 'application/json'
                      });
                      http_response.write(JSON.stringify({
                        success: true,
                        file: `http://dimaslanjaka.freesite.vip/` + fixname(file_mp3),
                        time: `${(Date.now() - start) / 1000}s`,
                        'size': size
                      }));
                      http_response.end();
                    });
                  });
                  */


                  // backend method
                  REQUEST(`${host}/ftp/upload_file?filename=${jsoninfo}`, function (error, res, body) {
                    fs.unlink(jsoninfo, (err) => {
                      //if (err) throw err;
                    });
                    REQUEST(`${host}/ftp/upload_file?filename=${file_mp3}`, function (error, res, body) {
                      fs.unlink(file_mp3, (err) => {
                        //if (err) throw err;
                      });
                      console.log('task done');
                      http_response.writeHead(200, { 'Content-Type': 'application/json' });
                      http_response.write(JSON.stringify({
                        success: true,
                        file: `http://dimaslanjaka.freesite.vip/` + fixname(file_mp3),
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
        }
      });
    }
  });



  //FTP handling
  app.get('/ftp/list', function (request, response) {
    let ftp = new PromiseFtp();
    ftp.connect(ftpConfig)
      .then(function (serverMessage) {
        return ftp.list('/public_html/', false);
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
          let errors = true,
            i = 0;
          let filename = decodeURIComponent(request.query.file).trim();
          files.forEach(function (file) {
            i++;
            if (file.name == filename) {
              errors = false;
              file.success = true;
              file.exists = true;
              return response.status(200).json(file);
            } else if (i >= files.length && errors === true && !response.headersSent) {
              return response.status(200).json({
                'error': `file ${request.query.file} not exists`
              });
            }
          });
        } else if (!response.headersSent) {
          return response.status(200).json({
            'directory': dir,
            'files': files
          });
        }
      });
  });

  app.get('/ftp/upload_file', function (request, response) {
    let filename;
    let ftp = new PromiseFtp();
    ftp.connect(ftpConfig)
      .then(function (serverMessage) {
        if (request.query.filename) {
          filename = fixname(decodeURIComponent(request.query.filename));
        } else {
          filename = 'saved.log';
        }
        ftp.put('./tmp/' + filename, '/public_html/' + filename);
      }).then(function (list) {
        //ftp.end();
      });
  });


}