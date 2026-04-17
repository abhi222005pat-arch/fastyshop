const multer = require('multer');
const path   = require('path');
const fs     = require('fs');

const DIR = path.join(__dirname, '..', 'uploads', 'products');
if (!fs.existsSync(DIR)) fs.mkdirSync(DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, DIR),
  filename:    (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `product-${Date.now()}-${Math.round(Math.random()*1e6)}${ext}`);
  },
});

const fileFilter = (req, file, cb) =>
  /^image\/(jpeg|jpg|png|webp|gif)/.test(file.mimetype)
    ? cb(null, true)
    : cb(new Error('Only image files allowed.'), false);

const upload = multer({ storage, fileFilter, limits: { fileSize: 5*1024*1024, files: 10 } });

const uploadImages = upload.fields([
  { name: 'image',         maxCount: 1 },
  { name: 'image_extra_1', maxCount: 1 },
  { name: 'image_extra_2', maxCount: 1 },
  { name: 'image_extra_3', maxCount: 1 },
  { name: 'image_extra_4', maxCount: 1 },
  { name: 'image_extra_5', maxCount: 1 },
]);

function handleUpload(mw) {
  return (req, res, next) => mw(req, res, err => {
    if (!err) return next();
    const msg = err.code === 'LIMIT_FILE_SIZE' ? 'File too large (max 5 MB).' : err.message || 'Upload error.';
    res.status(400).json({ success: false, message: msg });
  });
}

module.exports = { uploadImages, handleUpload };
