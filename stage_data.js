import { writeFileSync } from 'node:fs';

let nodes = [];
for (let i = 0; i < 500; ++i) {
  nodes.push({ id: crypto.randomUUID(), name: `file name ${i}`, nodeType: 'file', fileType: 'proc' });
  nodes.push({
    id: crypto.randomUUID(),
    name: `folder name ${i}`,
    nodeType: 'folder',
    children: [
      {
        id: crypto.randomUUID(),
        name: 'child',
        nodeType: 'file',
        fileType: 'proc',
      },
      {
        id: crypto.randomUUID(),
        name: 'child fold',
        nodeType: 'folder',
        children: [],
      },
    ],
  });
}
writeFileSync(
  './data/directory.json',
  JSON.stringify({ $schema: './schemas/directory.schema.json', data: nodes }, null, 4),
  { encoding: 'utf-8', flag: 'w' }
);
