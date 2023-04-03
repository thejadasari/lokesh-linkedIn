// import { LinkedInProfileScraper } from "linkedin-profile-scraper";

// Plain Javascript
const { LinkedInProfileScraper } = require("./src/index.js");

const puppeteer = require("puppeteer");

let _browserRef = null;

const setBrowser = (ref) => _browserRef = ref;

const getBrowser = () => _browserRef;

const SignIn = async () => {
  try {
    const browser = await puppeteer.launch({
      headless: false,
    });
    const newPage = await browser.newPage();
    await newPage.goto("https://linkedin.com/");
    await newPage.waitForSelector("input#session_key");
    await newPage.type("input#session_key", "uncutindia@gmail.com", {
      delay: 200,
    });
    await newPage.type("input#session_password", "Gujju1love", { delay: 200 });
    await newPage.keyboard.press("Enter");
    await newPage.waitForSelector(".feed-identity-module__actor-meta");
    await newPage.click(".feed-identity-module__actor-meta a");
    await newPage.waitForSelector("#profile-content");
    setBrowser(browser);
    return "Successfull Signed In"
  } catch (error) {
    throw error;
  }
};

const ScrapProfile = async (profilePath) => {
  try {
    const scraper = new LinkedInProfileScraper({
      timeout: 60000,
      keepAlive: true,
    });
    scraper.setBrowser(getBrowser());
    const result = await scraper.run(`https://www.linkedin.com/${profilePath}`);
    console.log(result);
    return result;
  } catch (error) {
    throw error;
  }
}

module.exports = {
  SignIn,
  ScrapProfile
}
