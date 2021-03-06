const yt = require("../src/YTDL-runner");
const process = require("process");
const root = process.cwd();
/**
 * Router Handler
 * @param {import("express").Express} app
 * @param {import("passport").PassportStatic} passport
 */
function f(app, passport) {
  console.clear(); //clear log
  app.get("/", function (req, res) {
    //res.render("index.ejs");
    app.render_template({ title: "Youtube Tools", content: "index.ejs" }, res);
  });

  //search videos youtube
  app.all("/search", function (req, res) {
    var query = req.query.q || null;
    var token = req.query.token || null;
    //console.log(query, token, req.query);
    if (query) {
      yt.search(query, token, function (error, items, response) {
        if (error) {
          console.log(error);
          res.json({ error: true });
        } else {
          response.error = false;
          response.data.error = false;
          response.data.next =
            serverInfo(req).origin +
            req.path +
            "?query=" +
            query +
            "&token=" +
            response.data.nextPageToken;

          res.json(response.data);
        }
      });
    } else {
      res.json({ error: true, message: "query required" });
    }
  });

  //grab mp3
  app.all("/process/mp3", function (req, res) {
    const id = req.query.id || null;
    const bitrate = req.query.bitrate || 128;
    if (id) {
      yt.start(id, bitrate, function () {
        if (!res.headersSent) {
          var arg = arguments;
          res.json({
            error: false,
            status: arg[0],
            size: arg[1],
          });
        }
      });
    } else {
      res.json({ error: true, message: "Youtube video id required" });
    }
  });

  //get status grab mp3
  app.all("/stats/mp3", function (req, res) {
    const id = req.query.id || null;
    const bitrate = req.query.bitrate || 128;
    if (id) {
    }
  });
}

/**
 * Get Server Info
 * @param {import("express").Request} req
 */
function serverInfo(req) {
  var userIP = req.socket.remoteAddress;
  var hostname = req.hostname;
  var protocol = req.protocol;
  var origin = `${protocol}://${hostname}`;
  return {
    host: hostname,
    protocol: protocol,
    ip: userIP,
    origin: origin,
  };
}

module.exports = f;
