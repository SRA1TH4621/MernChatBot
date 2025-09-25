const express = require("express");
const {
  generateRelatedSuggestions,
} = require("../controllers/suggestionsController");

const router = express.Router();
router.post("/", generateRelatedSuggestions);

module.exports = router;
