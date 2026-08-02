const fs = require('fs');
const path = require('path');
const dir = 'apps/frontend/src/components';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.tsx'));

files.forEach(file => {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  content = content.replace(/"\/DSC([^"]+)"/g, '"https://res.cloudinary.com/ujwz0e7r/image/upload/q_auto,f_auto/DSC$1"');
  content = content.replace(/"\/about_([^"]+)"/g, '"https://res.cloudinary.com/ujwz0e7r/image/upload/q_auto,f_auto/about_$1"');
  content = content.replace(/"\/services_([^"]+)"/g, '"https://res.cloudinary.com/ujwz0e7r/image/upload/q_auto,f_auto/services_$1"');
  content = content.replace(/"\/logo\.mp4"/g, '"https://res.cloudinary.com/ujwz0e7r/video/upload/q_auto,f_auto/logo.mp4"');
  fs.writeFileSync(filePath, content);
});
console.log("URLs updated!");
