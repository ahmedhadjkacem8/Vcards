import multer from "multer";
import path from "path";
import fs from "fs";

// Dossier de la galerie
const GALLERY_DIR = path.join(__dirname, "../../uploads/gallery");

if (!fs.existsSync(GALLERY_DIR)) {
  fs.mkdirSync(GALLERY_DIR, { recursive: true });
}

// Filtre MIME (images only)
const fileFilter = (req: any, file: any, cb: any) => {
  if (file.mimetype.startsWith("image/")) cb(null, true);
  else cb(new Error("Format invalide : seules les images sont acceptées"), false);
};

// Storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, GALLERY_DIR);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = `gallery-${Date.now()}${ext}`;
    cb(null, name);
  },
});

// Multer avec limites
export const uploadGallery = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB
  },
});

export const GALLERY_DIR_PATH = GALLERY_DIR;
