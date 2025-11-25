// scrapers/staticScraper.js
import axios from "axios";
import * as cheerio from "cheerio";

export async function scrapeStatic(url) {
  const { data } = await axios.get(url, {
    headers: {
      "User-Agent": "Mozilla/5.0"
    }
  });

  const $ = cheerio.load(data);

  // Ajustar selectores al sitio real
  const port = $("span.port-name").text().trim();
  const schedule = $("div.schedule").text().trim();
  const updated = $("div.last-update").text().trim();

  return {
    status: schedule || null,
    eta: updated || null,
    location: port || null,
    source: url
  };
}
