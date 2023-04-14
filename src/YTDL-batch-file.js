// batch download from text file

const { YTDL } = require("./YTDL");
const path = require("path");
const fs = require("fs-extra");
const sanitizefn = require("sanitize-filename");
const { writefile } = require("sbg-utility");

const yt = new YTDL({ debug: false });
yt.key(process.env.API_KEY);

// D:/bin/ffmpeg/bin
const destfolder = path.join(process.cwd(), "tmp/batch");
const batchfile = path.join(process.cwd(), "batch-list.txt");
const config = {
  dest: destfolder,
  list: fs
    .readFileSync(batchfile, "utf-8")
    .split(/\r?\n/gm)
    .map((str) => str.trim())
    .filter((str) => str.length !== 0),
};

async function batch() {
  const { dest } = config;
  for (let i = 0; i < config.list.length; i++) {
    const list = config.list[i];
    let title, url;
    if (typeof list === "object") {
      url = list.url.trim();
      title = list.title;
    } else {
      url = list.trim();
    }
    await yt
      .downloadMp3(url, 320, function (progress, result) {
        // console.log({ p1, p2 });
        if (typeof result === "object") {
          console.log(progress, {
            title: result.info.videoDetails.title,
            path: result.path,
          });
          fs.copySync(
            result.path,
            path.join(
              dest,
              sanitizefn((title || result.info.videoDetails.title) + ".mp3", {
                replacement: " ",
              }).replace(/\s+/gm, " ")
            ),
            {
              overwrite: true,
            }
          );
          const index = config.list.indexOf(url);
          if (index !== -1) {
            config.list.splice(index, 1);
          }
        }
      })
      .catch(function (e) {
        console.error("cannot download", url, title, e);
      });
  }
  writefile(batchfile, config.list.join("\n"));
}

batch();
