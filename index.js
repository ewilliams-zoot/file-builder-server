import express from 'express';
import { readFileSync, writeFileSync } from 'node:fs';
import { argv } from 'node:process';

const app = express();
const port = 3000;
let isDevMode = false;
if (argv.length > 2 && argv[2] === 'dev') {
  isDevMode = true;
}

app.use((req, res, next) => {
  if (isDevMode) {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:5173');
  }
  next();
});

app.get('/data/:dataName', (req, res) => {
  const jsonFile = readFileSync(`./data/${req.params.dataName}.json`, { encoding: 'utf-8' });
  res.setHeader('Content-Type', 'application/json').status(200).send(jsonFile);
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
