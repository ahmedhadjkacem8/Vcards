// src/middleware/upload.ts
import multer from "multer";
import path from "path";
import fs from "fs";

// Dossier où seront stockées les images
const UPLOAD_DIR = path.join(__dirname, "../../uploads");

// Crée le dossier s'il n'existe pas
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Configuration multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    // Exemple : avatar-<timestamp>.jpg
    const ext = path.extname(file.originalname);
    const name = `${file.fieldname}-${Date.now()}${ext}`;
    cb(null, name);
  },
});

export const upload = multer({ storage });
export const UPLOAD_DIR_PATH = UPLOAD_DIR;
