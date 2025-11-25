// utils/antiBlock.js
import logger from "./logger.js";

const USER_AGENTS = [
  // puedes agregar más
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15",
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0 Safari/537.36",
];

export function getRandomUserAgent() {
  const idx = Math.floor(Math.random() * USER_AGENTS.length);
  return USER_AGENTS[idx];
}

// SCRAPER_PROXIES="http://user:pass@ip:port, http://otro:puerto"
const PROXIES = process.env.SCRAPER_PROXIES
  ? process.env.SCRAPER_PROXIES.split(",").map((p) => p.trim())
  : [];

export function getRandomProxy() {
  if (!PROXIES.length) return null;
  const idx = Math.floor(Math.random() * PROXIES.length);
  return PROXIES[idx];
}

export function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function classifyBlock(status, html = "") {
  if (!status) return null;
  if (status === 403) return "forbidden";
  if (status === 429) return "rate_limited";
  if (html.includes("captcha") || html.includes("Cloudflare")) return "captcha";
  return null;
}

// helper para loguear un intento de scraping
export function logScrapeAttempt({ url, status, blocked, via }) {
  logger.info("Scrape attempt", { url, status, blocked, via });
}
