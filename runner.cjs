const cp = require('cross-spawn');
const { existsSync, readFileSync, writeFileSync } = require('fs');
const minimist = require('minimist');
const { join } = require('path');

// download musics to drive F
// node runner.cjs -o F: https://open.spotify.com/album/0wEsu54toSevjn1NIpqytB

const args = minimist(process.argv.slice(2));

(async function main() {
  const saveDir = args['o'] || args['output'];
  if (!saveDir) return console.log('save directory not defined');

  const lists = args._;
  // get batch.txt lines
  const batchtxt = join(process.cwd(), 'batch.txt');
  if (existsSync(batchtxt)) {
    const batch = readFileSync(batchtxt, 'utf-8')
      .split(/\r?\n/)
      .map(str => str.trim())
      .filter(str => str.length > 0);
    lists.push(...batch);
  }

  for (let i = 0; i < lists.length; i++) {
    const list = lists[i];
    await cp
      .async(
        'node',
        [
          join(__dirname, 'cli.js'),
          '--cookie-file',
          'cookie.txt',
          '--cache-file',
          'cache.txt',
          list,
        ],
        {
          cwd: saveDir,
          stdio: 'inherit',
          shell: true,
        },
      )
      .then(() => {
        // remove from batch.txt
        lists.splice(lists.indexOf(list), 1);
        writeFileSync(batchtxt, lists.join('\n'));
      });
  }
})();
