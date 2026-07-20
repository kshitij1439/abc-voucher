const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { upload } = require('../middleware/upload');

/**
 * @desc    Upload a signature image to Cloudinary
 * @route   POST /api/upload/signature
 * @access  Private
 */
router.post('/signature', authenticate, (req, res) => {
  const singleUpload = upload.single('signature');

  singleUpload(req, res, (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          message: 'File size too large. Maximum 2MB allowed.',
        });
      }
      return res.status(400).json({
        success: false,
        message: err.message || 'Error uploading file.',
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded.',
      });
    }

    res.json({
      success: true,
      message: 'Signature uploaded successfully.',
      data: {
        url: req.file.path,
        publicId: req.file.filename,
      },
    });
  });
});

module.exports = router;
