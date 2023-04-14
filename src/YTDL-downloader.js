const { YTDL } = require("./YTDL");
const path = require("path");

const dest = path.join(__dirname, "../tmp");
const yt = new YTDL();
yt.key(process.env.API_KEY);

// D:/bin/ffmpeg/bin

yt.downloadMp3(
  "https://www.youtube.com/watch?v=Waf149Aa95g",
  320,
  function (_progress, result) {
    // console.log({ p1, p2 });
    if (typeof result === "object") {
      console.log(result.info.videoDetails.title);
    }
  }
);
