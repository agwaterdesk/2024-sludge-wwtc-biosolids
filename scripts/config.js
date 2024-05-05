import fs from "fs-extra";

const CWD = process.cwd();
const configPath = `${CWD}/project.config.json`;
const projectConfig = JSON.parse(fs.readFileSync(configPath, "utf-8"));

export { projectConfig };
