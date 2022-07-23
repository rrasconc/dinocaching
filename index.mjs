import express from "express";
import fetch from "node-fetch";
import responseTime from "response-time";

import { createClient } from "redis";

const app = express();
const redisClient = createClient({
  host: "127.0.0.1",
  port: 6379,
});

redisClient.on("error", (err) => console.log("Redis Client Error", err));

await redisClient.connect();

app.use(responseTime());

app.get("/api/dinos/", async (req, res) => {
  const redisDinos = await redisClient.get("dinos");
  if (redisDinos) {
    return res.json({ dinos: JSON.parse(redisDinos).lenght });
  }
  const fetchRes = await fetch("https://dinosaurpictures.org/api/category/all");
  const dinos = await fetchRes.json();
  await redisClient.set("dinos", JSON.stringify(dinos));

  return res.json({ dinos: dinos.lenght });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
