import express from 'express';
import { readdirSync, rmSync } from 'node:fs';
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
  const dataContents = readdirSync('./data', { withFileTypes: true, recursive: true });

  let folders = { data: { children: [] } };
  for (const dirent of dataContents) {
    let newData;
    if (dirent.isFile()) {
      newData = {
        id: crypto.randomUUID(),
        nodeType: dirent.isFile() ? 'file' : 'folder',
        name: dirent.name,
        parentPath: dirent.parentPath,
        fileType: dirent.name.split('.')[1]
      };
    } else {
      newData = {
        id: crypto.randomUUID(),
        nodeType: 'folder',
        name: dirent.name,
        parentPath: dirent.parentPath,
        children: []
      };
      folders[dirent.name] = newData;
    }

    const pathParts = dirent.parentPath.split('/');
    const parentName = pathParts[pathParts.length - 1];
    folders[parentName].children.push(newData);
  }

  res.json({ data: folders.data.children });
});

app.delete('/api/folder/:path', (req, res) => {
  rmSync(req.params.path, { recursive: true });
  res.json({ status: 'success' });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
