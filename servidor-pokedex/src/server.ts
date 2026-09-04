import express from "express";
import { router } from "./routes";

const app = express();
const PORT = 3000;

// todo lo que empiece con /api lo atiende el router
app.use("/api", router);

app.listen(PORT, () => {
  console.log(`Servidor en http://localhost:${PORT}`);
});