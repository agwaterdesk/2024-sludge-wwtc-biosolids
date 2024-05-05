"use strict";
import config from "./gulp.config.js";

const { projectConfig, buildDir, batchDir, shell, slugifyItem } = config;

s3Deploy.description =
  "Upload the public directory to graphics.axios.com on AWS S3";

function s3Deploy(cb) {
  shell(
    [
      `aws s3 cp ${buildDir} s3://${projectConfig.s3.bucket}/${projectConfig.s3.folder} --recursive --metadata-directive REPLACE --cache-control max-age=30,public --acl public-read`,
    ],
    cb
  );
}

s3DeployBatch.description = "Upload the batches to the graphics S3";

function s3DeployBatch(cb) {
  for (const item of projectConfig.project.series) {
    const itemSlug = slugifyItem(item);
    shell(
      [
        `aws s3 cp ${buildDir} s3://${projectConfig.s3.bucket}/${projectConfig.s3.folder}-${itemSlug} --recursive --metadata-directive REPLACE --cache-control max-age=30,public --acl public-read`,
        `aws s3 cp ${batchDir}/${itemSlug} s3://${projectConfig.s3.bucket}/${projectConfig.s3.folder}-${itemSlug} --recursive --metadata-directive REPLACE --cache-control max-age=30,public --acl public-read
      `,
      ],
      cb
    );
  }
}

export { s3Deploy, s3DeployBatch };
