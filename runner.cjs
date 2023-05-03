const cp = require('cross-spawn');
const minimist = require('minimist');
const { join } = require('path');

// download musics to drive F
// node runner.cjs -o F: https://open.spotify.com/album/0wEsu54toSevjn1NIpqytB

const args = minimist(process.argv.slice(2));

(function main() {
  const lists = args._;
  const saveDir = args['o'] || args['output'];
  if (!saveDir) return console.log('save directory not defined');

  lists.forEach(list => {
    cp.async(
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
    );
  });
})();
