const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const cloudinary = require('cloudinary').v2;

cloudinary.config({ 
  cloud_name: 'ujwz0e7r', 
  api_key: '663372681466349', 
  api_secret: '2ngDS7EHl8-4vHtQkHRE9kYJ4V4' 
});

const publicDir = path.join(__dirname, 'apps/frontend/public');
const files = fs.readdirSync(publicDir);

const compressAndUploadVideo = async (filePath, fileName) => {
  const ext = path.extname(filePath);
  const compressedPath = filePath.replace(ext, `_compressed${ext}`);
  
  const stats = fs.statSync(filePath);
  if (stats.size > 99000000) {
    console.log(`Compressing large video ${fileName}...`);
    try {
      execSync(`ffmpeg -i "${filePath}" -vcodec libx264 -crf 30 -preset fast -y "${compressedPath}"`, { stdio: 'inherit' });
      await uploadMedia(compressedPath, fileName, "video");
    } catch(e) {
      console.error(`Failed to compress ${fileName}`, e);
    }
  } else {
    await uploadMedia(filePath, fileName, "video");
  }
}

const uploadMedia = async (filePath, publicId, resourceType) => {
  console.log(`Uploading ${publicId}...`);
  try {
    const res = await cloudinary.uploader.upload(filePath, { 
      resource_type: resourceType,
      public_id: publicId,
      chunk_size: 6000000
    });
    console.log(`Success: ${res.secure_url}`);
  } catch(e) {
    console.error(`Failed to upload ${publicId}:`, e.message || e);
  }
}

const main = async () => {
  for (const file of files) {
    const fullPath = path.join(publicDir, file);
    const ext = path.extname(file).toLowerCase();
    const fileName = path.parse(file).name;
    
    // skip already compressed artifacts
    if (file.includes('_comp')) continue;
    
    if (['.png', '.jpg', '.jpeg'].includes(ext)) {
      await uploadMedia(fullPath, fileName, "image");
    } else if (ext === '.mp4') {
      await compressAndUploadVideo(fullPath, fileName);
    }
  }
  console.log("All uploads complete!");
}

main();
