"use strict";
import config from "./gulp.config.js";

const { shell, timestamp } = config;

fallbacks.description = "Generate fallback images";

function fallbacks(cb) {
  shell([`npm run fallbacks`], cb);
}

batchFallbacks.description = "Generate fallback images for batches";

function batchFallbacks(cb) {
  shell([`npm run batch-fallbacks`], cb);
}

gitPushFallbacks.description = "Push newly created fallback images to GitHub";

function gitPushFallbacks(cb) {
  shell(
    [
      "git add -A .",
      `git commit -am "fallbacks created ${timestamp}"`,
      "git push",
    ],
    cb,
    {
      ignoreErrors: true,
    }
  );
}

export { fallbacks, batchFallbacks, gitPushFallbacks };
