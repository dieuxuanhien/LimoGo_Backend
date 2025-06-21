const multer = require('multer');
const path = require('path');
const fs = require('fs');
const uuid = require('uuid').v4;

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
     const uploadDir = path.join(__dirname, '..', 'public', 'uploads', 'images');
     if (!fs.existsSync(uploadDir)) {
       fs.mkdirSync(uploadDir, { recursive: true });
     }
    cb(null, uploadDir);
  },

  filename: (req, file, cb) => {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(uuid()) + path.extname(file.originalname).toLowerCase());
  }
});

const fileFilter = (req, file, cb) => {
  const allowedFileTypes = /jpeg|jpg|png|gif/;
  const extname = allowedFileTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedFileTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Chỉ cho phép file ảnh (JPEG, JPG, PNG, GIF)!'));
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 1024 * 1024 * 5 },
  fileFilter: fileFilter
});

exports.uploadImage = (req, res, next) => {
  // Call Multer's upload.single('image') directly
  upload.single('image')(req, res, (err) => {
    if (err) {
      // Handle Multer-specific errors (e.g., file size limit, file type filter)
      if (err instanceof multer.MulterError) {
        return res.status(400).json({ success: false, message: err.message });
      } else if (err) {
        // Handle other potential errors during file upload
        return res.status(500).json({ success: false, message: err.message });
      }
    }

    // If no error, and a file was actually uploaded by Multer:
    if (req.file) {
      // Construct the public URL for the image
      // IMPORTANT: This path must match how you serve your static files in app.js
      // If you're using: app.use('/uploads', express.static(path.join(__dirname, '..', 'public', 'uploads')));
      // Then the path will be:
      req.file.url = `/uploads/images/${req.file.filename}`;

      // If your static setup is: app.use(express.static(path.join(__dirname, 'public')));
      // The path will also be: `/uploads/images/${req.file.filename}`;

      // If your static setup is: app.use('/static-assets', express.static(path.join(__dirname, 'public')));
      // Then the path will be: `/static-assets/uploads/images/${req.file.filename}`;
    }

    // Pass control to the next middleware (your controller)
    next();
  });
};