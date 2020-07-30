const { src, dest, parallel, series, watch } = require("gulp");

// Load plugins

const rename = require("gulp-rename");
const concat = require("gulp-concat");
const changed = require("gulp-changed");
const terser = require("gulp-terser");

function build() {
  const source = "./index-ori.js";

  return src(source)
    .pipe(changed(source))
    .pipe(concat("index.js"))
    .pipe(terser())
    .pipe(dest("./"));
  //.pipe(browsersync.stream());
}

function watchFiles() {
  watch("./index-ori.js", build);
}

// Tasks to define the execution of the functions simultaneously or in series

exports.watch = parallel(watchFiles);
//exports.default = series(clear, parallel(js, css, img));
exports.default = series(build, watchFiles);
