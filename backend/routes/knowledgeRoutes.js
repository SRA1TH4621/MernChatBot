// backend/routes/knowledgeRoutes.js
const express = require("express");
const router = express.Router();
const {
  getWiki,
  getDefinition,
  getQuote,
  getJoke,
} = require("../controllers/knowledgeController");

router.get("/wiki", getWiki);
router.get("/define", getDefinition);
router.get("/quote", getQuote);
router.get("/joke", getJoke);

module.exports = router;
