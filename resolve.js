const fs = require('fs');
const path = require('path');

function resolveConflictsKeepIncoming(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');
  if (!content.includes('<<<<<<<')) return;
  
  const lines = content.split('\n');
  const resolvedLines = [];
  let inConflict = false;
  let keep = true;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.startsWith('<<<<<<<')) {
      inConflict = true;
      keep = false; // drop HEAD
    } else if (line.startsWith('=======')) {
      if (inConflict) {
        keep = true; // keep incoming
      } else {
        resolvedLines.push(line);
      }
    } else if (line.startsWith('>>>>>>>')) {
      if (inConflict) {
        inConflict = false;
      } else {
        resolvedLines.push(line);
      }
    } else {
      if (keep) {
        resolvedLines.push(line);
      }
    }
  }
  
  fs.writeFileSync(filePath, resolvedLines.join('\n'));
  console.log(`Resolved: ${filePath}`);
}

function walkDir(dir) {
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      if (file !== 'node_modules' && file !== '.git') {
        walkDir(filePath);
      }
    } else {
      if (filePath.endsWith('.js') || filePath.endsWith('.jsx')) {
        resolveConflictsKeepIncoming(filePath);
      }
    }
  }
}

walkDir(path.join(__dirname, 'frontend/src'));
