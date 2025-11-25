// src/api/index.js
import { Router } from "express";
import {
  getAllTracking,
  saveTracking,
  getTrackingsWithCoords,
  getHistoryByImo,
} from "../db/saveData.js";
import logger from "../utils/logger.js";
import { clean } from "../etl/clean.js";
import { transform } from "../etl/transform.js";
import { scrapeVesselsFromVesselFinder } from "../scrapers/vesselfinderScraper.js";
import { scrapeDynamicDemo } from "../scrapers/vesselfinderDynamic.js";
import { scrapeProtectedDemo } from "../scrapers/authenticatedScraper.js";
import { fetchXmlDemo } from "../utils/xmlClient.js";

export const api = Router();

// Lista lo que hay en Mongo
api.get("/tracking", async (req, res) => {
  const data = await getAllTracking();
  res.json(data);
});

// Mock de prueba (lo que ya hicimos)
api.get("/tracking/mock", async (req, res) => {
  try {
    const raw = {
      status: " In Transit ",
      eta: "2025-01-31",
      location: " Port of LA ",
      source: "manual-test",
    };

    const cleaned = clean(raw);
    const transformed = transform(cleaned);
    await saveTracking(transformed);

    res.json({
      ok: true,
      message: "Registro de prueba guardado",
      data: transformed,
    });
  } catch (err) {
    console.error("Error en /api/tracking/mock:", err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

// lanza scraping real en VesselFinder
api.get("/scrape/vessels", async (req, res) => {
  try {
    // puedes pasar ?limit=10 en la URL si quieres más barcos
    const limit = Number(req.query.limit || 5);

    const rawItems = await scrapeVesselsFromVesselFinder(limit);

    if (!rawItems.length) {
      return res.json({
        ok: true,
        message:
          "No se encontraron barcos o fallaron los selectores. Revisa el scraper.",
        inserted: 0,
      });
    }

    const cleaned = rawItems.map(clean);
    const transformed = cleaned.map(transform);

    for (const item of transformed) {
      await saveTracking(item);
    }

    res.json({
      ok: true,
      message: "Scraping completado desde VesselFinder",
      inserted: transformed.length,
    });
  } catch (err) {
    console.error("Error en /api/scrape/vessels:", err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

// API para el mapa
api.get("/tracking/map", async (req, res) => {
  try {
    const data = await getTrackingsWithCoords();
    res.json(data);
  } catch (err) {
    console.error("Error en /api/tracking/map:", err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

// API de historial AIS por IMO
api.get("/tracking/history/:imo", async (req, res) => {
  try {
    const { imo } = req.params;
    const limit = Number(req.query.limit || 20);

    const items = await getHistoryByImo(imo, limit);

    res.json({
      ok: true,
      imo,
      count: items.length,
      data: items,
    });
  } catch (err) {
    console.error("Error en /api/tracking/history/:imo:", err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

// Demo estático (ya lo tenías pero ahora usa tu scraper real + ETL si quieres)
api.get("/scrape/demo-static", async (req, res) => {
  try {
    const data = await scrapeVesselsFromVesselFinder(1); // 1 barco de demo
    res.json({
      ok: true,
      from: "VesselFinder static list",
      data: data[0] || null,
    });
  } catch (err) {
    logger.error("Error en demo estático", { error: err.message });
    res.json({ ok: false, error: err.message });
  }
});

// Demo dinámico con Playwright
api.get("/scrape/demo-dynamic", async (req, res) => {
  const result = await scrapeDynamicDemo();
  res.json(result);
});

// Demo scraping autenticado
api.get("/scrape/demo-auth", async (req, res) => {
  const result = await scrapeProtectedDemo();
  res.json(result);
});

// Demo XML
api.get("/xml/demo", async (req, res) => {
  const result = await fetchXmlDemo();
  res.json(result);
});

// Página de prueba para scraping estático (Cheerio)
api.get("/demo/static-page", (req, res) => {
  res.send(`
    <!doctype html>
    <html lang="en">
      <head><meta charset="utf-8"><title>Static Scraper Demo</title></head>
      <body style="font-family: sans-serif; padding: 2rem;">
        <h1>Static schedule demo</h1>

        <p>Información de un puerto falsa solo para pruebas.</p>

        <span class="port-name">Port of Demo</span>
        <div class="schedule">IN TRANSIT TO AWESOME PORT</div>
        <div class="last-update">2025-02-01 10:30 UTC</div>
      </body>
    </html>
  `);
});

// Página de prueba para scraping dinámico (Playwright)
api.get("/demo/dynamic-page", (req, res) => {
  res.send(`
    <!doctype html>
    <html lang="en">
      <head><meta charset="utf-8"><title>Dynamic Scraper Demo</title></head>
      <body style="font-family: sans-serif; padding: 2rem;">
        <h1>Dynamic status demo</h1>

        <p>Los datos se llenan con JavaScript después de 1 segundo.</p>

        <div class="status">Loading...</div>
        <div class="eta">Loading...</div>
        <div class="location">Loading...</div>

        <script>
          setTimeout(() => {
            document.querySelector(".status").innerText = "Under way sailing";
            document.querySelector(".eta").innerText = "2025-03-15 18:45 UTC";
            document.querySelector(".location").innerText = "Demo Harbor West";
          }, 1000);
        </script>
      </body>
    </html>
  `);
});

// Página de login DEMO
api.get("/demo/login-page", (req, res) => {
  res.send(`
    <!doctype html>
    <html>
      <body style="font-family:sans-serif; padding:2rem;">
        <h1>Demo Login</h1>
        <form>
          <input name="email" placeholder="email" />
          <br><br>
          <input name="password" type="password" placeholder="password" />
          <br><br>
          <button type="submit">Login</button>
        </form>
      </body>
    </html>
  `);
});

// Página protegida DEMO
api.get("/demo/protected", (req, res) => {
  res.send(`
    <!doctype html>
    <html>
      <body style="font-family:sans-serif; padding:2rem;">
        <h1>Zona Protegida DEMO</h1>
        <p>Acceso concedido ✔️</p>
      </body>
    </html>
  `);
});
