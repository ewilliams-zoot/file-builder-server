import express from 'express';
import { Dirent, mkdirSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { argv } from 'node:process';

const app = express();
const port = 3000;
let isDevMode = false;
if (argv.length > 2 && argv[2] === 'dev') {
  isDevMode = true;
}

app.use((req, res, next) => {
  if (isDevMode) {
    res.setHeaders(
      new Headers({
        'Access-Control-Allow-Origin': 'http://localhost:5173',
        'Access-Control-Allow-Methods': '*',
        'Access-Control-Allow-Headers': '*',
        'Access-Control-Max-Age': '600',
        'Access-Control-Allow-Credentials': 'true'
      })
    );
  }
  next();
});

app.get('/api/directory', (req, res) => {
  const readPath = req.query.path?.toString();
  if (!readPath) {
    res.status(400).json({ detail: 'path param must be present' });
    return;
  }
  /** @type {Dirent[]} */
  const dataContents = readdirSync(readPath, { encoding: 'utf-8', withFileTypes: true });
  res.json({
    data: dataContents.map((dirent) => ({
      parentPath: dirent.parentPath,
      name: dirent.name,
      nodeType: dirent.isFile() ? 'file' : 'folder'
    }))
  });
});

app.put('/api/folder', express.json(), (req, res) => {
  const { folderName, parentPath } = req.body;

  mkdirSync(`${parentPath}/${folderName}`);
  res.json({ status: 'success' });
});

app.put('/api/file', express.json(), (req, res) => {
  const { fileName, parentPath, initialData } = req.body;
  let modifiedFileName = fileName;

  const dirents = readdirSync(parentPath, { encoding: 'utf-8', withFileTypes: true });
  const files = dirents.filter((dirent) => dirent.isFile() && dirent.name.split('|')[0] === fileName);

  files.sort((a, b) => {
    if (a < b) return -1;
    else if (a > b) return 1;
    return 0;
  });

  if (files.length === 1) {
    modifiedFileName = `${fileName}|1`;
  } else if (files.length > 1) {
    let fileNameModifier = -1;
    let i = 1;
    for (const file of files) {
      const existingModifier = file.name.split('|')[1];
      if (existingModifier && existingModifier !== `${i}`) {
        fileNameModifier = i;
        break;
      }
      if (existingModifier) {
        i += 1;
      }
    }
    if (fileNameModifier !== -1) {
      // we found a gap in the number on the end
      modifiedFileName = `${fileName}|${fileNameModifier}`;
    } else {
      // we just need to add one to the last same-named file's modifier number
      modifiedFileName = `${fileName}|${i}`;
    }
  }

  console.log(fileName, modifiedFileName);

  writeFileSync(`${parentPath}/${modifiedFileName}`, initialData, { flag: 'w', encoding: 'utf-8' });
  res.json({ status: 'success' });
});

app.delete('/api/folder', (req, res) => {
  const deletePath = req.query.path?.toString();
  if (!deletePath) {
    res.status(400).json({ detail: 'Path query param is required' });
    return;
  }

  rmSync(deletePath, { recursive: true });
  res.json({ status: 'success' });
});

app.delete('/api/file', (req, res) => {
  const deletePath = req.query.path?.toString();
  if (!deletePath) {
    res.status(400).json({ detail: 'Path query param is required' });
    return;
  }

  rmSync(deletePath);
  res.json({ status: 'success' });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
