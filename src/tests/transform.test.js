// tests/transform.test.js
import { describe, it, expect } from "vitest";
import { transform } from "../etl/transform.js";

describe("ETL transform()", () => {
  it("normaliza IMO, estado, destino y fechas", () => {
    const raw = {
      imo: "IMO  9648714 ",
      mmsi: "  123456789  ",
      callsign: " vNKL ",
      vesselName: "  PRELUDE ",
      type: " Crude Oil Tanker ",
      flag: " Australia ",
      length: "400 m",
      width: "  60,5 ",
      lastAIS: "2025-03-15 18:45 UTC",
      speed: "13.4 kn",
      course: "180 °",
      status: "Under way using engine",
      eta: "2025-03-20 10:00 UTC",
      location: "BROWSE BASIN AU",
      source: "https://www.vesselfinder.com/vessels/details/9648714",
    };

    const out = transform(raw);

    // IMO solo números
    expect(out.imo).toBe("9648714");

    // MMSI solo números
    expect(out.mmsi).toBe("123456789");

    // Status normalizado
    expect(out.status).toBe("under_way");

    // Location normalizada a slug
    expect(out.location).toBe("browse_basin_au");

    // Tipo y bandera en formato slug
    expect(out.type).toBe("crude_oil_tanker");
    expect(out.flag).toBe("australia");

    // Fechas normalizadas como Date (o null)
    expect(out.lastAIS === null || out.lastAIS instanceof Date).toBe(true);
    expect(out.eta === null || out.eta instanceof Date).toBe(true);

    // Speed y course como número
    expect(out.speed).toBeTypeOf("number");
    expect(out.course).toBeTypeOf("number");

    // Metadata
    expect(out.source).toBe(raw.source);
    expect(out.extractedAt).instanceOf(Date);
  });

  it("maneja valores vacíos sin romperse", () => {
    const out = transform({
      imo: null,
      mmsi: null,
      status: "",
      location: "",
      speed: null,
      course: null,
      source: "demo",
    });

    expect(out.imo).toBeNull();
    expect(out.mmsi).toBeNull();
    expect(out.status).toBe("unknown");
    expect(out.location).toBeNull();
    expect(out.speed).toBeNull();
    expect(out.course).toBeNull();
    expect(out.source).toBe("demo");
  });
});
