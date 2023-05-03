const cp = require('cross-spawn');
const { join } = require('path');

const lists = [
  'https://open.spotify.com/track/6dEscZ97JfOeYK4EVaPSpr?si=77e2b9fff35147a1',
];

lists.forEach(list => {
  cp.sync(
    'node',
    [
      '../cli.js',
      '--cookie-file',
      'cookie.txt',
      '--cache-file',
      'cache.txt',
      list,
    ],
    {
      cwd: join(__dirname, 'tmp'),
      stdio: 'inherit',
      shell: true,
    },
  );
});
