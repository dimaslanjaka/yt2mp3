// batch download from text file

const path = require('path');
const fs = require('fs-extra');
const { writefile } = require('sbg-utility');
const { default: batch } = require('./YTDL-batch');

// D:/bin/ffmpeg/bin
const destfolder = path.join(process.cwd(), 'tmp/batch');
const batchfile = path.join(process.cwd(), 'batch-list.txt');
const config = {
  dest: destfolder,
  list: fs
    .readFileSync(batchfile, 'utf-8')
    .split(/\r?\n/gm)
    .map((str) => str.trim())
    .filter((str) => str.length !== 0)
};

batch(config).then(() => writefile(batchfile, config.list.join('\n')));
