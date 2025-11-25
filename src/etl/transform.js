// src/etl/transform.js

/**
 * Transforma los datos limpios a un formato estándar
 * listo para guardar en MongoDB.
 */
export function transform(data) {
  return {
    // Identidad
    imo: normalizeIMO(data.imo),
    mmsi: normalizeMMSI(data.mmsi),
    callsign: normalizeCallsign(data.callsign),
    vesselName: normalizeName(data.vesselName),
    type: normalizeType(data.type),
    flag: normalizeFlag(data.flag),

    // Dimensiones
    length: normalizeDimension(data.length),
    width: normalizeDimension(data.width),

    // AIS
    lastAIS: normalizeDateTime(data.lastAIS),
    speed: normalizeSpeed(data.speed),
    course: normalizeCourse(data.course),

    // Tracking
    status: normalizeStatus(data.status),
    eta: parseDate(data.eta),
    location: normalizeLocation(data.location),

    // Coordenadas
    lat: normalizeNumber(data.lat),
    lon: normalizeNumber(data.lon),

    // Metadata
    source: data.source ?? "unknown",
    extractedAt: new Date(),
  };
}

// ----------------------
// Normalizadores
// ----------------------

function normalizeIMO(str) {
  if (!str) return null;
  return str.replace(/\D/g, "");
}

function normalizeMMSI(str) {
  if (!str) return null;
  return str.replace(/\D/g, "");
}

function normalizeCallsign(str) {
  if (!str) return null;
  return str.trim().toUpperCase();
}

function normalizeName(name) {
  if (!name) return null;
  return name.trim();
}

function normalizeType(str) {
  if (!str) return null;
  return str.trim().toLowerCase().replace(/\s+/g, "_");
}

function normalizeFlag(str) {
  if (!str) return null;
  return str.trim().toLowerCase().replace(/\s+/g, "_");
}

function normalizeDimension(value) {
  if (!value) return null;
  const num = parseFloat(String(value).replace(",", "."));
  return isNaN(num) ? null : num;
}

function parseDate(raw) {
  if (!raw) return null;
  const parsed = new Date(raw);
  return isNaN(parsed.getTime()) ? null : parsed;
}

function normalizeDateTime(raw) {
  if (!raw) return null;

  // Si tus fechas vienen tipo "2025-02-16 13:45 UTC",
  // esto ayuda a que JS las entienda como ISO.
  const normalized = String(raw).replace(" UTC", "Z");
  const parsed = new Date(normalized);

  if (isNaN(parsed.getTime())) return null; // si no entiende, lo dejamos null

  return parsed;
}

function normalizeStatus(str = "") {
  const s = String(str).toLowerCase();
  if (s.includes("under way")) return "under_way";
  if (s.includes("moored")) return "moored";
  if (s.includes("at anchor")) return "at_anchor";
  if (s.includes("stopped")) return "stopped";
  return "unknown";
}

function normalizeLocation(str = "") {
  if (!str) return null;

  return str
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/[,/()-]+/g, "_")
    .replace(/_+/g, "_")
    .replace(/[^a-z0-9_]/g, "");
}

function normalizeSpeed(value) {
  if (value === null || value === undefined) return null;
  if (typeof value === "number") return value;
  const num = parseFloat(String(value).trim().replace(",", "."));
  return isNaN(num) ? null : num;
}

function normalizeCourse(value) {
  if (value === null || value === undefined) return null;
  const num = parseFloat(value);
  return isNaN(num) ? null : num;
}

function normalizeNumber(v) {
  if (v === null || v === undefined) return null;
  const n = parseFloat(v);
  return isNaN(n) ? null : n;
}