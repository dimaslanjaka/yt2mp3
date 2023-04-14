## yt2mp3 NodeJS project
- Youtube to mp3 engine : [ytdl-core](https://github.com/fent/node-ytdl-core#readme)
- Dynamic routing : [EJS](https://ejs.co/)
- [FFMPEG](https://www.npmjs.com/package/ffmpeg)
- [FFMPEG installation](http://www.ffmpeg.org/download.html)

## environment

create `.env` file and fill below config then run `node -r dotenv/config your_file.js`

```properties
TIMES=2
API_KEY=YOUR_API_KEY
```

## config batch

fill url list at `batch-list.txt` (must same directory with `process.cwd()`) then import or run `src/YTDL-batch-file.js`
