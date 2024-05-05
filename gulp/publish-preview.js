"use strict";
import log from "fancy-log";
import config from "./gulp.config.js";

const { prodUrl, colors, shell } = config;

logPublish.description = "Output the graphic's URL to your terminal";

function logPublish(cb) {
  log("");
  log(
    "🎉  ",
    colors.green.bold(
      "Your project can be accessed and embedded using the following url:"
    )
  );
  log(`\t${prodUrl}`);
  log("");
  log("👉  ", colors.blue.bold("Login to the Axios CMS:"));
  log("\thttps://eden.axios.com/dashboard");
  log("");
  cb();
}

previewUrl.description =
  "Open a browser tab to the visual and copy the URL to your clipboard";

function previewUrl(cb) {
  log("");
  log("📋  ", colors.blue.bold("Copied to your clipboard:"));
  log(`\t${prodUrl}`);
  log("");

  shell([`echo ${prodUrl} | pbcopy`, `open ${prodUrl}`], cb);
}

export { logPublish, previewUrl };
