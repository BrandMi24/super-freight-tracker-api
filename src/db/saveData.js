// db/saveData.js
import mongoose from "mongoose";
import { connectDB } from "./connection.js";

// Esquema
const trackingSchema = new mongoose.Schema({
  vesselName: String,
  imo: String,
  mmsi: String,
  callsign: String,

  type: String,
  flag: String,

  length: Number,
  width: Number,

  status: String,
  eta: Date,
  location: String,

  speed: Number,
  course: Number,

  lastAIS: Date,

  lat: Number,
  lon: Number,

  source: String,

  extractedAt: Date,
  createdAt: { type: Date, default: Date.now },
});

// 👇 HISTORIAL: una sola fila por (imo + lastAIS)
trackingSchema.index({ imo: 1, lastAIS: 1 }, { unique: true });

const Tracking = mongoose.model("Tracking", trackingSchema);

// Conectar DB
await connectDB();

/**
 * Guarda cada tracking como un documento separado.
 * También evita guardar barcos sin IMO.
 */
export async function saveTracking(data) {
  if (!data.imo) {
    console.log("⚠️ Saltando barco sin IMO:", data.vesselName);
    return;
  }

  // si tu ETL deja lastAIS vacío, al menos algo consistente
  const lastAIS = data.lastAIS || null;

  const filter = { imo: data.imo, lastAIS };

  await Tracking.updateOne(
    filter,
    {
      $set: {
        ...data,
        lastAIS,
      },
      $setOnInsert: {
        createdAt: new Date(),
      },
    },
    { upsert: true }
  );

  console.log(
    `💾 Tracking HISTORIAL upsert IMO=${data.imo} lastAIS=${lastAIS || "null"}`
  );
}

/**
 * Leer último registro por barco (para tabla principal)
 *  - 1 doc por IMO
 *  - el más reciente (por lastAIS / createdAt)
 */
export async function getAllTracking(limit = 50) {
  const pipeline = [
    // Ordenamos primero: más reciente arriba
    { $sort: { lastAIS: -1, createdAt: -1 } },

    // Agrupamos por IMO y nos quedamos con el primer doc de cada grupo
    {
      $group: {
        _id: "$imo",
        doc: { $first: "$$ROOT" },
      },
    },

    // Devolvemos solo el documento
    { $replaceRoot: { newRoot: "$doc" } },

    // Orden opcional para la tabla (por nombre, por ejemplo)
    { $sort: { vesselName: 1 } },

    // Límite de barcos a mostrar
    { $limit: limit },
  ];

  return Tracking.aggregate(pipeline);
}

/**
 * Para mapa — solo barcos con lat/lon
 */
export async function getTrackingsWithCoords() {
  return Tracking.find({
    lat: { $ne: null },
    lon: { $ne: null },
  })
    .sort({ lastAIS: -1, createdAt: -1 })
    .limit(200);
}

/**
 * Historial AIS por IMO
 * (del más reciente al más viejo)
 */
export async function getHistoryByImo(imo, limit = 20) {
  return Tracking.find({ imo })
    .sort({ lastAIS: -1 })
    .limit(limit);
}

export { Tracking };
