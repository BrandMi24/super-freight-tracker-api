// tests/trackingRoutes.test.js
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import mongoose from "mongoose";
import app from "../app.js";
import { saveTracking } from "../db/saveData.js";

const TEST_IMO = "9999999";

describe("Rutas de tracking", () => {
  beforeAll(async () => {
    // conecta a la misma MONGO_URI de tu .env
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGO_URI);
    }

    // insertamos un barco de prueba
    await saveTracking({
      imo: TEST_IMO,
      mmsi: "123456789",
      vesselName: "TEST VESSEL",
      status: "under_way",
      location: "TEST_PORT",
      speed: 10.5,
      lastAIS: new Date().toISOString(),
      eta: new Date(Date.now() + 3600_000).toISOString(),
      flag: "testland",
      type: "test type",
      source: "unit-test",
    });
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  it("GET /api/tracking devuelve lista de barcos", async () => {
    const res = await request(app).get("/api/tracking");

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);

    const found = res.body.find((v) => v.imo === TEST_IMO);
    expect(found).toBeTruthy();
    expect(found.vesselName).toBe("TEST VESSEL");
  });

  it("GET /api/tracking/history/:imo devuelve historial para el IMO", async () => {
    const res = await request(app).get(
      `/api/tracking/history/${TEST_IMO}?limit=5`
    );

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("ok", true);
    expect(Array.isArray(res.body.data)).toBe(true);

    if (res.body.data.length > 0) {
      const item = res.body.data[0];
      expect(item.imo).toBe(TEST_IMO);
    }
  });
});
