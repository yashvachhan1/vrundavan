const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const cloudinary = require('cloudinary').v2;

cloudinary.config({ 
  cloud_name: 'ujwz0e7r', 
  api_key: '663372681466349', 
  api_secret: '2ngDS7EHl8-4vHtQkHRE9kYJ4V4' 
});

const files = [
  'apps/frontend/public/01.mp4',
  'apps/frontend/public/04.mp4',
  'apps/frontend/public/ENGAGEMENT TEASER.mp4'
];

const compressVideo = (filePath) => {
  const ext = path.extname(filePath);
  const compressedPath = filePath.replace(ext, `_comp${ext}`);
  console.log(`Compressing ${filePath}...`);
  try {
    // using crf 30 to guarantee it drops below 100MB
    execSync(`ffmpeg -i "${filePath}" -vcodec libx264 -crf 30 -preset fast -y "${compressedPath}"`, { stdio: 'inherit' });
    
    // check size
    const stats = fs.statSync(compressedPath);
    if (stats.size > 99000000) {
      console.log(`Still too large (${stats.size} bytes). Compressing more...`);
      execSync(`ffmpeg -i "${filePath}" -vcodec libx264 -crf 35 -preset fast -y "${compressedPath}"`, { stdio: 'inherit' });
    }
    
    // replace original
    fs.renameSync(compressedPath, filePath);
    console.log(`Compression complete for ${filePath}`);
  } catch(e) {
    console.error(`Failed to compress ${filePath}`, e);
  }
}

const uploadVideo = async (filePath) => {
  const fileName = path.parse(filePath).name;
  console.log(`Uploading ${fileName} to Cloudinary...`);
  try {
    const res = await cloudinary.uploader.upload(filePath, { 
      resource_type: "video",
      public_id: fileName,
      chunk_size: 6000000
    });
    console.log(`Uploaded ${fileName}:`, res.secure_url);
  } catch(e) {
    console.error(`Failed to upload ${fileName}:`, e);
  }
}

const main = async () => {
  for (const file of files) {
    const fullPath = path.join(__dirname, file);
    if (fs.existsSync(fullPath)) {
      compressVideo(fullPath);
      await uploadVideo(fullPath);
    }
  }
  console.log("All tasks finished successfully!");
}

main();
