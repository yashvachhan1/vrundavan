const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const cloudinary = require('cloudinary').v2;

cloudinary.config({ 
  cloud_name: 'ujwz0e7r', 
  api_key: '663372681466349', 
  api_secret: '2ngDS7EHl8-4vHtQkHRE9kYJ4V4' 
});

const failedImages = [
  'DSC00101.JPG', 'DSC06391.jpg', 'DSC06545.JPG.jpeg', 'DSC06585.JPG.jpeg',
  'DSC06608.JPG.jpeg', 'DSC06623.JPG.jpeg', 'DSC06629.JPG.jpeg', 
  'DSC06643.JPG.jpeg', 'DSC06650.JPG.jpeg', 'DSC06846.JPG.jpeg'
];

const publicDir = path.join(__dirname, 'apps/frontend/public');

const main = async () => {
  for (const file of failedImages) {
    const fullPath = path.join(publicDir, file);
    if (fs.existsSync(fullPath)) {
      const fileName = path.parse(file).name;
      const compPath = fullPath.replace(path.extname(file), '_comp.jpg');
      
      console.log(`Compressing ${file}...`);
      try {
        // Compress using ffmpeg to a much smaller size (q:v 5 is decent compression for jpeg)
        execSync(`ffmpeg -i "${fullPath}" -q:v 5 -y "${compPath}"`);
        
        console.log(`Uploading ${fileName}...`);
        const res = await cloudinary.uploader.upload(compPath, { 
          resource_type: "image",
          public_id: fileName,
        });
        console.log(`Success: ${res.secure_url}`);
      } catch(e) {
        console.error(`Failed on ${file}`, e.message);
      }
    }
  }
}

main();
