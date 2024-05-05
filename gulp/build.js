"use strict";
import config from "./gulp.config.js";

const { shell } = config;

build.description =
  "Compile all your code, styles, and assets to the build directory";

function build(cb) {
  shell([`npm run build`], cb);
}

export { build };
