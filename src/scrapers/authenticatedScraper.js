// scrapers/authenticatedScraper.js
import { chromium } from "playwright";
import logger from "../utils/logger.js";
import { getRandomUserAgent } from "../utils/antiBlock.js";

/**
 * Demo de scraping autenticado.
 * Usa variables de entorno:
 *   DEMO_LOGIN_URL
 *   DEMO_LOGIN_USER
 *   DEMO_LOGIN_PASS
 *
 */
export async function scrapeProtectedDemo() {
  const loginUrl = process.env.DEMO_LOGIN_URL || "http://localhost:3000/api/demo/login-page";

  logger.info("Iniciando scraper autenticado demo", { loginUrl });

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: getRandomUserAgent(),
  });
  const page = await context.newPage();

  try {
    await page.goto(loginUrl, { waitUntil: "networkidle" });

    // DEMO: estos selectores deberías adaptarlos si usas un sitio real
    const user = process.env.DEMO_LOGIN_USER || "demo@example.com";
    const pass = process.env.DEMO_LOGIN_PASS || "password";

    await page.fill('input[name="email"]', user);
    await page.fill('input[name="password"]', pass);
    await page.click('button[type="submit"]');

    await page.waitForLoadState("networkidle");

    // Cookies / sesión guardadas
    const cookies = await context.cookies();

    // Ahora visitar una página protegida
    const protectedUrl =
      process.env.DEMO_PROTECTED_URL || "http://localhost:3000/api/demo/protected";
    await page.goto(protectedUrl, { waitUntil: "networkidle" });

    const htmlSnippet = await page.evaluate(() => {
      return document.body.innerText.slice(0, 500);
    });

    await browser.close();

    return {
      ok: true,
      loginUrl,
      protectedUrl,
      cookiesCount: cookies.length,
      htmlSnippet,
    };
  } catch (err) {
    await browser.close();
    logger.error("Error en scraper autenticado", {
      loginUrl,
      error: err.message,
    });
    return {
      ok: false,
      loginUrl,
      error: err.message,
    };
  }
}
