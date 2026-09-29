const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('El archivo debe ser una imagen válida'), false);
    }
  }
});

const processImage = async (req, res, next) => {
  if (!req.file) return next();

  const uploadDir = path.join(__dirname, '../../uploads');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const filename = `disfraz-${Date.now()}.jpg`;
  const outputPath = path.join(uploadDir, filename);

  try {
    await sharp(req.file.buffer)
      .resize(600, 600, { fit: 'cover', position: 'center' })
      .toFormat('jpeg')
      .jpeg({ quality: 85 })
      .toFile(outputPath);

    req.body.imagenUrl = `/uploads/${filename}`;
    next();
  } catch (error) {
    res.status(500).json({ error: 'Error al procesar la imagen' });
  }
};

module.exports = { uploadSingle: upload.single('imagen'), processImage };