const express = require("express");
const router = express.Router();
const multer = require("multer");
const visionHandler = require("../controllers/visionController");

// ✅ Use memory storage to access buffer directly
const upload = multer({ storage: multer.memoryStorage() });

router.post("/vision", upload.single("image"), visionHandler);

module.exports = router;
