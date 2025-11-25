// src/cron/run.js
import cron from "node-cron";
import { scrapeVesselsFromVesselFinder } from "../scrapers/vesselfinderScraper.js";
import { clean } from "../etl/clean.js";
import { transform } from "../etl/transform.js";
import { saveTracking } from "../db/saveData.js";

cron.schedule("*/30 * * * *", async () => {
  console.log("⏱ Ejecutando scraping automático de VesselFinder...");

  try {
    const raw = await scrapeVesselsFromVesselFinder(5);

    const cleaned = raw.map(clean);
    const transformed = cleaned.map(transform);

    for (const item of transformed) {
      await saveTracking(item);
    }

    console.log(`✅ Scraping automático completado (${transformed.length} barcos)`);
  } catch (err) {
    console.error("❌ Error en scraping automático:", err.message);
  }
});

console.log("⏰ CRON ACTIVADO (cada 30 minutos)");
