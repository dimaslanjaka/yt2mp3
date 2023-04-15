// batch download from config

const path = require('path');
const { default: batch } = require('./YTDL-batch');

// D:/bin/ffmpeg/bin

const config = {
  dest: path.join(process.cwd(), 'tmp/batch'),
  list: [
    {
      url: 'https://www.youtube.com/watch?v=nnoKQA_EXDs&pp=ygUebGFndSBub3N0YWxnaWEgc2VsZW5kYW5nIG1lcmFo',
      title: 'Rani - Selendang Merah'
    }
  ]
};

batch(config);
