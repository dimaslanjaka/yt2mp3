// batch download from config

const { YTDL } = require("./YTDL");
const path = require("path");
const fs = require("fs-extra");
const sanitizefn = require("sanitize-filename");

const yt = new YTDL({ debug: false });
yt.key(process.env.API_KEY);

// D:/bin/ffmpeg/bin

const config = {
  dest: path.join(process.cwd(), "tmp/batch"),
  list: [
    {
      url: "https://www.youtube.com/watch?v=Waf149Aa95g",
      title: "Meriam Bellina - Walau Hati Menangis",
    },
    {
      url: "https://www.youtube.com/watch?v=zxe31glgQRw",
      title: "Meriam Bellina - Jangan Salahkan Siapa",
    },
    "https://www.youtube.com/watch?v=0WeYhLCqgTo",
    "https://www.youtube.com/watch?v=soboiKJDbtE",
    "https://www.youtube.com/watch?v=8IEm_GDBijE",
    "https://www.youtube.com/watch?v=-vYBhenc8O8",
    "https://www.youtube.com/watch?v=C7RxDLMGI10",
  ],
};

async function batch() {
  const { dest } = config;
  for (let i = 0; i < config.list.length; i++) {
    const list = config.list[i];
    let title, url;
    if (typeof list === "object") {
      url = list.url;
      title = list.title;
    } else {
      url = list;
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
              sanitizefn((title || result.info.videoDetails.title) + ".mp3")
            ),
            {
              overwrite: true,
            }
          );
        }
      })
      .catch(function () {
        console.error("cannot download", url, title);
      });
  }
}

batch();
