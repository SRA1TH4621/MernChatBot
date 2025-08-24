const express = require("express");
const PDFDocument = require("pdfkit");

const router = express.Router();

/**
 * POST /api/export
 * Body: { messages: [{ sender: "user"|"bot", text: "..." }] }
 */
router.post("/export", (req, res) => {
  const { messages } = req.body || {};
  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: "No messages provided" });
  }

  // Basic size guard
  const maxChars = 60_000;
  const totalLen = messages.reduce((n, m) => n + (m.text?.length || 0), 0);
  if (totalLen > maxChars) {
    return res.status(413).json({ error: "Conversation too large to export" });
  }

  const doc = new PDFDocument({ margin: 48 });
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", 'attachment; filename="chat.pdf"');

  doc.pipe(res);

  doc.fontSize(20).text("💬 Esmeray Chat History", { align: "center" });
  doc.moveDown();

  messages.forEach((m) => {
    const who = m.sender === "user" ? "YOU" : "ESMERAY";
    doc
      .fontSize(12)
      .fillColor(m.sender === "user" ? "#0d6efd" : "#16a34a")
      .text(`${who}:`, { continued: true })
      .fillColor("#111111")
      .text(` ${m.text || ""}`);
    doc.moveDown(0.35);

    // Optional: include image URLs under the turn
    if (m.image) {
      doc.fontSize(10).fillColor("#6b7280").text(`(image: ${m.image})`);
      doc.moveDown(0.25);
    }
  });

  doc.end();
});

module.exports = router;
