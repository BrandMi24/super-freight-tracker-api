// src/etl/clean.js

/**
 * Limpieza básica de los datos crudos del scraper.
 * - Quita espacios
 * - Convierte strings vacíos o "N/A" en null
 * - Deja números como están (speed, course)
 * - Prepara todo para transform()
 */

function normalizeRawString(value) {
  if (!value) return null;
  const trimmed = String(value).trim();
  if (!trimmed || trimmed.toLowerCase() === "n/a") return null;
  return trimmed;
}

export function clean(data) {
  return {
    // Identificación
    imo: normalizeRawString(data.imo),
    mmsi: normalizeRawString(data.mmsi),
    callsign: normalizeRawString(data.callsign),
    vesselName: normalizeRawString(data.vesselName),
    type: normalizeRawString(data.type),
    flag: normalizeRawString(data.flag),

    // Medidas
    length: normalizeRawString(data.length),
    width: normalizeRawString(data.width),

    // Datos AIS
    lastAIS: normalizeRawString(data.lastAIS),
    speed: data.speed ?? null,
    course: data.course ?? null,

    // Posición / destino / estado
    status: normalizeRawString(data.status),
    eta: normalizeRawString(data.eta),
    location: normalizeRawString(data.location),

    // Metadata
    source: data.source ?? null,
  };
}
