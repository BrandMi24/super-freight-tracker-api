// utils/xmlClient.js
import axios from "axios";
import { parseStringPromise } from "xml2js";
import logger from "./logger.js";

export async function fetchAndParseXml(url) {
  logger.info("Descargando XML", { url });

  const res = await axios.get(url, {
    headers: { Accept: "application/xml,text/xml" },
  });

  const xml = res.data;
  const json = await parseStringPromise(xml, { explicitArray: false });

  return { xml, json };
}

// demo para endpoint
export async function fetchXmlDemo() {
  const demoUrl =
    "https://www.w3schools.com/xml/note.xml"; // feed XML simple de demo
  try {
    const { json } = await fetchAndParseXml(demoUrl);
    return {
      ok: true,
      from: demoUrl,
      data: json,
    };
  } catch (err) {
    logger.error("Error en XML demo", { error: err.message });
    return { ok: false, error: err.message };
  }
}
