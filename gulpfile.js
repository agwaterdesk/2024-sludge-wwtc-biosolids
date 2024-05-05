import gulp from "gulp";
import inquirer from "inquirer";
// import config from "../gulp/gulp.config";
import { build } from "./gulp/build.js";
import { gitPush } from "./gulp/git-push.js";
import { s3Deploy } from "./gulp/s3-deploy.js";
import { logPublish, previewUrl } from "./gulp/publish-preview.js";
import { fallbacks } from "./gulp/fallbacks.js";
import projectConfig from "./project.config.json" assert { type: "json" };

const warnings = {
  projectSlug: `
┌────────────────────────────────────────────────────────┐
│           🚨 Error: Invalid project slug! 🚨           │
│                                                        │
│ Confirm that the project slug is set properly in       │
│ project.config.json and index.html. Otherwise, embeds  │
│ won't work in Eden.                                    │
│                                                        │
│ When possible, please use the New Project Generator at │
│ https://github.com/axiosvisuals/new-project-generator  │
└────────────────────────────────────────────────────────┘
    `
};

function promptFallbacks({ yesTasks, noTasks, cb }) {
  if (
    projectConfig.project.slug == "[insert slug]" ||
    projectConfig.project.slug == ""
  ) {
    console.log(warnings.projectSlug);
    cb();
    process.exit(1);
  }



  inquirer
    .prompt([
      {
        type: "confirm",
        message: "Create new fallbacks?",
        default: false,
        name: "fallbacks",
      },
    ])
    .then((answers) => {
      if (answers.fallbacks) {
        gulp.series(yesTasks)();
      } else {
        gulp.series(noTasks)();
      }
      cb();
    });
}

const publish = (cb) => {
  promptFallbacks({
    yesTasks: [
      fallbacks,
      build,
      gitPush,
      s3Deploy,
      logPublish,
      previewUrl
    ],
    noTasks: [build, gitPush, s3Deploy, logPublish, previewUrl],
    cb,
  });
};
publish.description =
  "A series of commands which publishes a visual to the graphics S3 bucket";


export {
  publish,
  build,
  gitPush,
  s3Deploy,
  logPublish,
  previewUrl,
  fallbacks,
};

export default publish;
