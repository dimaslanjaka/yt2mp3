## yt2mp3 NodeJS project
- Youtube to mp3 engine : [ytdl-core](https://github.com/fent/node-ytdl-core)
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

fill url list at `batch-youtube.txt` (must same directory with `process.cwd()`) then import or run `ts-node -r dotenv/config src/YTDL-batch-file.ts`

## sample files
- downloader https://github.com/dimaslanjaka/yt2mp3/blob/master/src/YTDL-downloader.js
- search query https://github.com/dimaslanjaka/yt2mp3/blob/56d0740fa2ed4d51c03a98d9502cdd6a9e900268/src/YTDL.js#L209-L256

## Test
tested and working `FFMPEG` with below version:
```log
ffmpeg version git-2019-11-26-59d264b Copyright (c) 2000-2019 the FFmpeg developers
built with gcc 9.2.1 (GCC) 20191125
configuration: --enable-gpl --enable-version3 --enable-sdl2 --enable-fontconfig --enable-gnutls --enable-iconv --enable-libass --enable-libdav1d --enable-libbluray --enable-libfreetype --enable-libmp3lame --enable-libopencore-amrnb --enable-libopencore-amrwb --enable-libopenjpeg --enable-libopus --enable-libshine --enable-libsnappy --enable-libsoxr --enable-libtheora --enable-libtwolame --enable-libvpx --enable-libwavpack --enable-libwebp --enable-libx264 --enable-libx265 --enable-libxml2 --enable-libzimg --enable-lzma --enable-zlib --enable-gmp --enable-libvidstab --enable-libvorbis --enable-libvo-amrwbenc --enable-libmysofa --enable-libspeex --enable-libxvid --enable-libaom --enable-libmfx --enable-ffnvcodec --enable-cuvid --enable-d3d11va --enable-nvenc --enable-nvdec --enable-dxva2 --enable-avisynth --enable-libopenmpt --enable-amf
libavutil      56. 36.100 / 56. 36.100
libavcodec     58. 62.100 / 58. 62.100
libavformat    58. 35.100 / 58. 35.100
libavdevice    58.  9.101 / 58.  9.101
libavfilter     7. 67.100 /  7. 67.100
libswscale      5.  6.100 /  5.  6.100
libswresample   3.  6.100 /  3.  6.100
libpostproc    55.  6.100 / 55.  6.100
```
