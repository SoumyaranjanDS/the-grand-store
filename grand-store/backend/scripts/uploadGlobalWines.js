require("dotenv").config();
const cloudinary = require("cloudinary").v2;

// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_API_NAME || "oioqrgj0",
//   api_key: process.env.CLOUDINARY_API_KEY || "782922137546894",
//   api_secret:
//     process.env.CLOUDINARY_API_SECRET || "9sgEWIPABZjV0aOy1gIFu9i7KXY",
// });

const files = {
  "South Africa":
    "c:/Users/soumy/OneDrive/Desktop/HTML/internship/project-15-grandstore/grand-store/frontend/public/globla wines/image.png",
  "United States":
    "c:/Users/soumy/OneDrive/Desktop/HTML/internship/project-15-grandstore/grand-store/frontend/public/globla wines/image copy.png",
  "New Zealand":
    "c:/Users/soumy/OneDrive/Desktop/HTML/internship/project-15-grandstore/grand-store/frontend/public/globla wines/image copy 2.png",
  Argentina:
    "c:/Users/soumy/OneDrive/Desktop/HTML/internship/project-15-grandstore/grand-store/frontend/public/globla wines/image copy 3.png",
  Chile:
    "c:/Users/soumy/OneDrive/Desktop/HTML/internship/project-15-grandstore/grand-store/frontend/public/globla wines/image copy 4.png",
};

async function uploadFiles() {
  for (const [country, path] of Object.entries(files)) {
    try {
      const result = await cloudinary.uploader.upload(path, {
        folder: "grand-store/global-wines",
      });
      console.log(`[${country}] -> ${result.secure_url}`);
    } catch (err) {
      console.error(`Error uploading ${country}:`, err);
    }
  }
}

uploadFiles();
