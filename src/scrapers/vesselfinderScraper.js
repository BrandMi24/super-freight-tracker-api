// scrapers/vesselfinderScraper.js
import axios from "axios";
import * as cheerio from "cheerio";
import logger from "../utils/logger.js";
import {
  getRandomUserAgent,
  getRandomProxy,
  sleep,
  classifyBlock,
  logScrapeAttempt,
} from "../utils/antiBlock.js";

const BASE_URL = "https://www.vesselfinder.com";

export async function scrapeVesselsFromVesselFinder(limit = 5) {
  const listUrl = `${BASE_URL}/vessels`;

  logger.info("Scraping lista de barcos (estático)", { url: listUrl });

  const { data: html, status } = await axios.get(listUrl, {
    headers: { "User-Agent": getRandomUserAgent() },
    // si usas proxies HTTP clásicos, puedes configurar aquí
    // proxy: getRandomProxy() ? { host, port } : undefined
  });

  const blocked = classifyBlock(status, html);
  logScrapeAttempt({ url: listUrl, status, blocked, via: "axios" });

  if (blocked) {
    logger.warn(`Posible bloqueo en listado: ${blocked}`);
  }

  const $ = cheerio.load(html);

  const detailUrls = [];

  $("a[href^='/vessels/details/']").each((_, el) => {
    const href = $(el).attr("href") || "";

    if (href.startsWith("/vessels/details/")) {
      const fullUrl = new URL(href, BASE_URL).href;
      detailUrls.push(fullUrl);
    }

    if (detailUrls.length >= limit) return false;
  });

  logger.info(`Encontrados ${detailUrls.length} barcos en listado`);

  const results = [];
  for (const url of detailUrls) {
    try {
      await sleep(1000 + Math.random() * 1500); // delay random
      const vessel = await scrapeVesselDetail(url);
      if (vessel) results.push(vessel);
    } catch (err) {
      logger.error("Error scrapeando barco", { url, error: err.message });
    }
  }

  return results;
}

async function scrapeVesselDetail(url) {
  logger.info("Scraping detalle barco", { url });

  const { data: html, status } = await axios.get(url, {
    headers: { "User-Agent": getRandomUserAgent() },
  });

  const blocked = classifyBlock(status, html);
  logScrapeAttempt({ url, status, blocked, via: "axios" });

  if (blocked) {
    logger.warn(`Posible bloqueo en detalle: ${blocked}`);
  }

  const $ = cheerio.load(html);

  const vesselName = $("h1").first().text().trim() || null;

  function getField(labelText) {
    let value = null;
    $("*").each((_, el) => {
      const txt = $(el).text().trim();
      if (txt === labelText) {
        const next = $(el).next();
        if (next && next.text()) value = next.text().trim();
        return false;
      }
    });
    return value;
  }

  const imo = getField("IMO number");
  const mmsi = getField("MMSI");
  const callsign = getField("Callsign");
  const type = getField("Vessel type");
  const flag = getField("Flag");
  const length = getField("Length Overall");
  const width = getField("Beam");
  const lastAIS = getField("Last report");
  const destination = getField("Destination");
  const eta = getField("ETA:");
  const navStatus = getField("Navigation Status");
  const courseSpeed = getField("Course / Speed");

  let speed = null;
  let course = null;

  if (courseSpeed) {
    const sp = courseSpeed.match(/([0-9.]+)\s*kn/i);
    const cr = courseSpeed.match(/([0-9.]+)\s*°/i);
    if (sp) speed = parseFloat(sp[1]);
    if (cr) course = parseFloat(cr[1]);
  }

  return {
    vesselName,
    imo,
    mmsi,
    callsign,
    type,
    flag,
    length,
    width,
    lastAIS,
    status: navStatus,
    eta,
    location: destination,
    speed,
    course,
    source: url,
  };
}
