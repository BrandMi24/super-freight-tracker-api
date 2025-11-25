// src/app.js
import express from "express";
import cors from "cors";
import { api } from "./api/index.js";
import "./db/connection.js";

const app = express();

app.use(
  cors({
    origin: [
      "http://localhost:3001",
      "http://localhost:3000",
    ],
  })
);

app.use(express.json());

app.use("/api", api);

export default app;
