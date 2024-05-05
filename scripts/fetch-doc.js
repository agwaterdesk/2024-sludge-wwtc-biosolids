//author: Russel Goldenberg, The Pudding
//https://github.com/the-pudding/starter/blob/master/scripts/fetch-doc.js

import fs from "fs-extra";
import archieml from "archieml";
import request from "request";

import { projectConfig } from "./config.js";
const { doc } = projectConfig.google;

const CWD = process.cwd();

const makeRequest = (opt, cb) => {
  const url = `https://docs.google.com/document/d/${opt.id}/export?format=txt`;
  request(url, (error, response, body) => {
    if (error) console.log(error);
    else if (response) {
      const parsed = archieml.load(body);
      const str = JSON.stringify(parsed);
      const file = `${CWD}/${opt.filepath || "data/doc.json"}`;
      fs.outputFile(file, str, (err) => {
        if (err) console.error(err);
        cb();
      });
    }
  });
};

function init() {
  let i = 0;
  const next = () => {
    const d = doc[i];
    if (d.id)
      makeRequest(d, () => {
        i += 1;
        if (i < doc.length) next();
        else process.exit();
      });
  };

  next();
}

init();
