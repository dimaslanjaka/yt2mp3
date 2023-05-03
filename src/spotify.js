// https://github.com/spotDL/spotify-downloader - spotdl
// https://github.com/SwapnilSoni1999/spotify-dl - spotifydl

const cp = require('cross-spawn');
const { resolve } = require('path');

cp.spawn('spotdl', ['https://open.spotify.com/album/3UYU1aLHlyf95lwKosp5WP?si=OwIgbPh4SqCZnWhc1W0V3Q'], {
  cwd: resolve('F:/')
});
