import express from "express";
import { createClient } from "redis";

const app = express();
const redisPort = process.env.REDIS_PORT;
const redisHost = process.env.REDIS_HOST;
const redisUrl = `redis://${redisHost}:${redisPort}`;
const redisClient = createClient({
  url: redisUrl
});
await redisClient.connect();
const redisKey = "hits";

app.get("/", (req, res) => {
  console.log("Request started");
  redisClient
    .get(redisKey)
    .then((redisData) => {
      if (redisData) {
        console.log(redisData);
        let jsonData = JSON.parse(redisData);
        let currentVisits = jsonData.num + 1;
        let data = { num: currentVisits };
        redisClient.set(redisKey, JSON.stringify(data));
        res.send(`I have been viewed ${currentVisits} times.`);
      } else {
        let data = { num: 1 };
        redisClient.set(redisKey, JSON.stringify(data));
        res.send(`I have been viewed ${data.num} time.`);
      }
    })
    .catch((err) => {
        console.log(err)
        res.status(500).send("Sorry, there's been a problem")});
});

app.get("/health", (req, res) => {
  res.send("Ok");
});

app.listen(3000, () => {
  console.log("Node server started");
  console.log(`Redis Host: ${redisHost}`);
  console.log(`Redis Port: ${redisPort}`);
});
