// tests/demoRoutes.test.js
import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../app.js";

describe("Rutas de demo de scraping", () => {
  it("GET /api/demo/static-page devuelve HTML de demo", async () => {
    const res = await request(app).get("/api/demo/static-page");

    expect(res.status).toBe(200);
    expect(res.type).toMatch(/html/);
    expect(res.text).toContain("Static Scraper Demo");
    expect(res.text).toContain("Static schedule demo");
    expect(res.text).toContain("Port of Demo");
  });

  it("GET /api/demo/dynamic-page devuelve HTML dinámico de demo", async () => {
    const res = await request(app).get("/api/demo/dynamic-page");

    expect(res.status).toBe(200);
    expect(res.type).toMatch(/html/);
    expect(res.text).toContain("Dynamic Scraper Demo");
    expect(res.text).toContain("Dynamic status demo");
    expect(res.text).toContain("Loading...");
  });

  it("GET /api/xml/demo parsea XML a JSON", async () => {
    const res = await request(app).get("/api/xml/demo");

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("ok", true);
    expect(res.body).toHaveProperty("data");
  });

  it("GET /api/scrape/demo-auth responde aunque falle el login", async () => {
    const res = await request(app).get("/api/scrape/demo-auth");

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("ok");
    expect(res.body).toHaveProperty("loginUrl");
  });
});
