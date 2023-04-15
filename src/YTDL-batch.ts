import { YTDL } from './YTDL';
import path = require('path');
import fs = require('fs-extra');
import sanitizefn = require('sanitize-filename');

export interface batchConf {
  [key: string]: any;
  /**
   * destination folder to save mp3
   */
  dest: string;
  /**
   * list youtube url or object
   */
  list: (
    | string
    | {
        url: string;
        title: string;
      }
  )[];
}

export default async function batch(config: batchConf) {
  if (!config) throw new Error('config required');
  const yt = new YTDL({ debug: false });
  yt.key(process.env.API_KEY);

  const { dest } = config;
  for (let i = 0; i < config.list.length; i++) {
    const list = config.list[i];
    let title: string, url: string | { url: string; title: string };
    if (typeof list === 'object') {
      url = list.url.trim();
      title = list.title;
    } else {
      url = list.trim();
    }
    await yt
      .downloadMp3(url, 320, function (progress, result) {
        // console.log({ p1, p2 });
        if (typeof result === 'object') {
          const copyDest = path.join(
            dest,
            sanitizefn((title || result.info.videoDetails.title) + '.mp3', {
              replacement: ' '
            }).replace(/\s+/gm, ' ')
          );
          fs.copySync(String(result.path), copyDest, {
            overwrite: true
          });
          console.log('convert ytmp3 ' + progress, {
            originalTitle: result.info.videoDetails.title,
            title: title || result.info.videoDetails.title,
            sanitizedTitle: sanitizefn(title || result.info.videoDetails.title),
            path: result.path
          });
          const index = config.list.indexOf(url);
          if (index !== -1) {
            config.list.splice(index, 1);
          }
        }
      })
      .catch(function (e) {
        console.error('cannot download', url, title, e);
      });
  }
  // writefile(batchConfig, config.list.join('\n'));
}
