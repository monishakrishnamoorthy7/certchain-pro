const multer = require('multer');
const path   = require('path');

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedExt = new Set(['.pdf', '.png', '.jpg', '.jpeg']);
  const allowedMime = new Set(['application/pdf', 'image/png', 'image/jpeg']);
  const originalName = (file.originalname || '').trim();
  const ext = path.extname(originalName).toLowerCase();
  const mime = (file.mimetype || '').toLowerCase();

  if (allowedExt.has(ext) || allowedMime.has(mime)) {
    cb(null, true);
    return;
  }

  console.warn('Upload rejected', {
    originalName: file.originalname,
    mimetype: file.mimetype,
    ext
  });

  const err = new Error('Unsupported file type. Allowed: PDF, PNG, JPG');
  err.status = 400;
  cb(err, false);
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: fileFilter
});

module.exports = upload;
