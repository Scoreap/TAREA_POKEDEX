import express from "express";
import path from "path";
import { router } from "./routes.js";

const app = express();
const PORT = process.env.PORT ?? 3000;

app.use(express.static(path.join(import.meta.dirname, "..", "public")));

// API consumida por el frontend bajo /api.
app.use("/api", router);

app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});