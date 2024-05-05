import puppeteer from "puppeteer";
import jimp from "jimp";
import fs from "fs-extra";
import path from "path";
import minimist from "minimist";
import { projectConfig } from "./config.js";

const argv = minimist(process.argv.slice(2));
const isBatch = argv.type === "batch";

const destinationPath = isBatch ? "batches" : "public/fallbacks";
const slug = projectConfig.project.slug;
const queryStringVar = projectConfig.project.queryStringVar;
const url = "http://localhost:3000/";
const containerId = ".chart-container";

const fallbackSizes = [
  { name: "apple", width: 375, toResize: false },
  { name: "fallback", width: 600, toResize: false },
  { name: "social", width: 800, height: 450, toResize: true },
  { name: "insta", width: 600, isSquare: true, toResize: true, instaSlide: 0 },
];

if (projectConfig.instaSlides > 1) {
  for (let i = 1; i < projectConfig.instaSlides; i++) {
    fallbackSizes.push({
      name: `insta-${i}`,
      instaSlide: i,
      width: 600,
      isSquare: true,
      toResize: true,
    });
  }
}

const slugifyItem = (str) => {
  let outString = str
    .replaceAll(/[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/gi, "")
    .replaceAll(" ", "");
  return outString;
};

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Take the screenshots
 * @param {Array} fallbackSizes Array of configuration for the different fallback sizes
 * @param {string} url Url to take a screenshot of
 * @returns Array of image buffers
 */
const takeScreenshot = async (config, url) => {
  let browser = await puppeteer.launch({ headless: "new" });
  let page = await browser.newPage();
  await page.setCacheEnabled(false);

  // Waits to make sure the server is spun up. You can increase this if necessary.
  await sleep(4000);
  await page.goto(url, { waitUntil: "networkidle0" });

  await page.waitForSelector(containerId);

  // Constrain width and adjust height to fit everything in .chart-container
  await page.setViewport({
    width: config.width,
    height: 800, // arbitrary, will be reset below
  });

  await page.evaluate(
    (config, containerId) => {
      const ignore = document.querySelectorAll(".hide-in-static");
      ignore.forEach((el) => (el.style.display = "none"));

      const chart = document.querySelector(containerId);
      chart.classList.add("is-screenshot");

      let name = config.name;
      if (config.name.includes("insta")) {
        name = "insta";
        chart.setAttribute("data-insta", config.instaSlide);
      }

      chart.classList.add(`is-screenshot--${name}`);
    },
    config,
    containerId
  );

  const example = await page.$(containerId);
  const chartContainerSize = await example.boundingBox();

  const viewportHeight = config.isSquare
    ? config.width
    : parseInt(chartContainerSize.height);

  await page.setViewport({
    width: config.width,
    height: viewportHeight,
    deviceScaleFactor: 2, // retina
  });

  // Capture all of .chart-container
  const clip = {
    x: chartContainerSize.x,
    y: chartContainerSize.y,
    width: chartContainerSize.width,
    height: chartContainerSize.height,
  };

  // Take the shot
  let screenshot = await page.screenshot({
    type: "png",
    clip,
  });

  if (config.toResize) {
    screenshot = await resizeToFit(config, screenshot);
  }

  const pages = await browser.pages();
  await Promise.all(pages.map((p) => p.close()));

  await browser.close();

  return {
    size: config.name,
    screenshot,
  };
};

/**
 * Resize the images that require specific sizes (eg. social & insta)
 * @param {Object} config Fallback size configuration
 * @param {Buffer} screenshot Image buffer of the screenshot
 * @returns Resized image in Buffer form
 */
const resizeToFit = async (config, screenshot) => {
  const height = config.isSquare ? config.width : config.height;

  const imageToResize = await jimp.read(Buffer.from(screenshot));

  imageToResize.background(0xffffffff).contain(config.width * 2, height * 2); // contain within these dimensions

  return await imageToResize.getBufferAsync(jimp.MIME_PNG);
};

/**
 * Call the screenshot function & save the results to the desired directory
 * @param {string} url Url to screenshot
 * @param {string} slug Project or local slug
 * @param {string} destinationPath Path where images should be saved
 */
const createFallbacks = async (url, slug, destinationPath) => {
  try {
    const screenshots = await Promise.all(
      fallbackSizes.map((size) => takeScreenshot(size, url))
    );
    // const screenshots = await takeScreenshot(fallbackSizes, url);

    for (let i = 0; i < screenshots.length; i++) {
      const screenshot = screenshots[i];
      fs.writeFileSync(
        `${destinationPath}/${slug}-${screenshot.size}.png`,
        Buffer.from(screenshot.screenshot)
      );
    }

    console.log(`Fallbacks created for ${slug}`);
  } catch (error) {
    console.log(error);
    console.error(
      "Unable to connect at http://0.0.0.0:3000/. 🚨 Make sure you have gulp serve running. 🚨"
    );
  }
};

/**
 * Empty & create the fallback destination directory if it doesn't exist
 * @param {string} dir Fallback destination directory
 */
const createFolder = async (dir) => {
  fs.emptyDirSync(dir);
  console.log(`Fallback directory for "${dir}" created`);
};

/**
 * Initializes the fallback script. If this is for batch fallbacks, loops over each item in the project config series.
 * @returns
 */
const init = async () => {
  console.log("Taking fallbacks");
  if (isBatch) {
    for (const local of projectConfig.project.series) {
      const localItemSlug = slugifyItem(local);
      const localDir = path.join(destinationPath, localItemSlug, "fallbacks");
      const localUrl = `${url}?${queryStringVar}=${local}`;
      const localSlug = `${slug}-${localItemSlug}`;

      await createFolder(localDir);
      await createFallbacks(localUrl, localSlug, localDir);
    }
    console.log("Batch fallbacks created ✨");
    return;
  }

  await createFolder(destinationPath);
  await createFallbacks(url, slug, destinationPath);
  console.log("Fallbacks created ✨");
};

init();
