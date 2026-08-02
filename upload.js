const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');

cloudinary.config({ 
  cloud_name: 'ujwz0e7r', 
  api_key: '663372681466349', 
  api_secret: '2ngDS7EHl8-4vHtQkHRE9kYJ4V4' 
});

const uploadVideo = async (filePath) => {
  const fileName = path.parse(filePath).name;
  console.log(`Uploading ${fileName}...`);
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
  await uploadVideo(path.join(__dirname, 'apps/frontend/public/01.mp4'));
  await uploadVideo(path.join(__dirname, 'apps/frontend/public/04.mp4'));
  await uploadVideo(path.join(__dirname, 'apps/frontend/public/ENGAGEMENT TEASER.mp4'));
  console.log("All uploads complete!");
}
main();
