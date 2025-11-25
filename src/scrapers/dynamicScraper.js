// scrapers/dynamicScraper.js
import { chromium } from "playwright";
import { randomUserAgent } from "./proxyManager.js";

export async function scrapeDynamic(url) {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: randomUserAgent(),
  });

  const page = await context.newPage();
  await page.goto(url, { waitUntil: "networkidle" });

  // Ajustar estos selectores reales al sitio que elijas
  await page.waitForTimeout(2000);

  const data = await page.evaluate(() => {
    return {
      status: document.querySelector(".status")?.innerText || null,
      eta: document.querySelector(".eta")?.innerText || null,
      location: document.querySelector(".location")?.innerText || null,
    };
  });

  await browser.close();
  return { ...data, source: url };
}
