# Super Freight Tracker · API (Node.js + Scraping + MongoDB)

Backend API de **Super Freight Tracker**, un servicio en Node.js que:

- Realiza **web scraping** de VesselFinder (HTML estático con Cheerio).
- Expone endpoints REST para:
  - Consultar trackings guardados en MongoDB.
  - Lanzar scrapers desde la API.
  - Probar scrapers estáticos y dinámicos (Playwright).
  - Consultar historial AIS por IMO.
- Incluye una mini capa **ETL**:
  - `clean` → limpieza y normalización básica.
  - `transform` → modelado antes de guardar.

---

## 🧱 Tech Stack

- **Node.js + Express**
- **MongoDB** mediante `mongoose`
- **Cheerio** (`axios + cheerio`) para scraping estático
- **Playwright** para scraping dinámico
- **Cron Jobs** (opcional)
- **Docker** para empaquetar API + Mongo

---

## 📂 Estructura del Proyecto

```
/api
  src/
    api/
      index.js                # Rutas Express
    db/
      connection.js           # Conexión MongoDB
      saveData.js             # Modelo Tracking + funciones CRUD
    etl/
      clean.js                # Limpieza de datos crudos
      transform.js            # Normalización / modelo estandarizado
    scrapers/
      vesselfinderScraper.js  # Scraper real VesselFinder
      dynamicScraper.js       # Scraper Playwright
    cron/
      job.js                  # Tareas programadas (opcional)
  package.json
  Dockerfile
  .env
  .env.docker
```

---

## ⚙️ Variables de Entorno

### Desarrollo local (`.env`)
```
MONGO_URI=mongodb://127.0.0.1:27017/freight
PORT=3000
```

### Docker (`.env.docker`)
```
MONGO_URI=mongodb://mongo:27017/freight
PORT=3000
```

---

## 🚀 Correr en Local

Instalar dependencias:

```
npm install
```

Levantar la API:

```
npm start
```

Disponible en:

➡️ http://localhost:3000

---

## 🌐 Endpoints Principales

### 1. **GET /api/tracking**

Lista los últimos ~50 trackings guardados en MongoDB.

### 2. **GET /api/tracking/mock**

Guarda un tracking de prueba usando la capa **clean + transform**.

### 3. **GET /api/scrape/vessels?limit=5**

Ejecuta scraping real en VesselFinder.

### 4. **GET /api/tracking/history/:imo?limit=20**

Historial AIS por IMO.

### 5. **Scrapers de prueba / demo**

- `/api/scrape/demo-static`
- `/api/scrape/demo-dynamic`
- `/api/demo/static-page`
- `/api/demo/dynamic-page`

---

## 🧪 ETL (clean + transform)

### `etl/clean.js`
- Trim de strings
- Normalización de campos crudos

### `etl/transform.js`
- Normaliza IMO, MMSI, callsign
- Normaliza tipo, bandera, ubicación
- Convierte ETA / timestamps a ISO
- Convierte speed a número
- Ajusta status

---

## 🐳 Docker

### Build:
```
docker build -t freight-api .
```

### Run:
```
docker run --env-file .env.docker -p 3000:3000 freight-api
```

---

## 📄 Licencia

MIT — siéntete libre de modificar, reusar o extender.
