"use strict";
import config from "./gulp.config.js";

const { timestamp, shell } = config;

gitPush.description = "Push any unstaged commits to Github";

function gitPush(cb) {
  shell(
    [`git add -A .`, `git commit -am "latest as of ${timestamp}"`, `git push`],
    cb,
    {
      ignoreErrors: true,
    }
  );
}

export { gitPush };
