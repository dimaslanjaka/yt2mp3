const { YTDL } = require("./YTDL");
const path = require("path");

const dest = path.join(__dirname, "../tmp");
const yt = new YTDL();
yt.key(process.env.API_KEY);
yt.downloadMp3("ioVyjAG77mU", 320, function (p1, p2) {
  console.log(p1, p2);
});
