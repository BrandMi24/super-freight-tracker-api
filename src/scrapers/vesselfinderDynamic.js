// scrapers/vesselfinderDynamic.js
import { chromium } from "playwright";
import logger from "../utils/logger.js";
import {
  getRandomUserAgent,
  getRandomProxy,
  sleep,
  classifyBlock,
  logScrapeAttempt,
} from "../utils/antiBlock.js";

export async function scrapeDynamicDemo() {
  const url = process.env.DEMO_DYNAMIC_URL || "http://localhost:3000/api/demo/dynamic-page"; // demo local

  logger.info("Scraping dinámico (Playwright demo)", { url });

  const browser = await chromium.launch({
    headless: true,
  });

  const proxy = getRandomProxy();
  const context = await browser.newContext({
    userAgent: getRandomUserAgent(),
    proxy: proxy ? { server: proxy } : undefined,
  });

  const page = await context.newPage();

  try {
    // 🔹 Aquí capturamos el response de la navegación
    const response = await page.goto(url, { waitUntil: "networkidle" });
    await sleep(500 + Math.random() * 500);

    const status = response?.status() ?? 200;
    const html = await page.content();
    const blocked = classifyBlock(status, html);
    logScrapeAttempt({ url, status, blocked, via: "playwright" });

    const data = await page.evaluate(() => {
      return {
        title: document.title,
        status: document.querySelector(".status")?.innerText || null,
        eta: document.querySelector(".eta")?.innerText || null,
        location: document.querySelector(".location")?.innerText || null,
      };
    });

    return {
      ok: true,
      from: url,
      status,
      data,
    };
  } catch (err) {
    logger.error("Error en scrape dinámico demo", { url, error: err.message });
    return {
      ok: false,
      from: url,
      error: err.message,
    };
  } finally {
    await browser.close();
  }
}
