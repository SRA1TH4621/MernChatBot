// tests/ghibli.test.js
const request = require("supertest");
const { expect } = require("chai");
const fs = require("fs");
const path = require("path");

const API_BASE = "http://localhost:5000/api"; // adjust if deployed
const sampleImage = path.join(__dirname, "test.png");

// Make sure test.png exists
if (!fs.existsSync(sampleImage)) {
  console.warn("⚠️ test.png not found, creating dummy PNG...");
  const dummyPng = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIW2NkYGD4DwABBAEAUzjGJgAAAABJRU5ErkJggg==",
    "base64"
  );
  fs.writeFileSync(sampleImage, dummyPng);
}

describe("🎬 Ghibli Image Generator API Tests", function () {
  this.timeout(40000); // allow long requests (40s)

  it("should generate with Replicate", async function () {
    if (!process.env.REPLICATE_API_KEY) {
      console.warn("⚠️ Skipping Replicate test (no API key)");
      this.skip();
    }

    const res = await request(API_BASE)
      .post("/ghibli")
      .field("provider", "replicate")
      .field("prompt", "Totoro in the forest")
      .attach("image", sampleImage);

    expect(res.status).to.equal(200);
    expect(res.body).to.have.property("output");
    console.log("✅ Replicate Output URL:", res.body.output);
  });

  it("should generate with Getimg", async function () {
    if (!process.env.GETIMG_API_KEY) {
      console.warn("⚠️ Skipping Getimg test (no API key)");
      this.skip();
    }

    const res = await request(API_BASE)
      .post("/ghibli")
      .field("provider", "getimg")
      .field("prompt", "Princess Mononoke battle")
      .attach("image", sampleImage);

    expect(res.status).to.equal(200);
    expect(res.body).to.have.property("output");
    console.log("✅ Getimg Output URL:", res.body.output);
  });

  it("should return redirect URL for Dzine", async () => {
    const res = await request(API_BASE)
      .post("/ghibli")
      .field("provider", "dzine")
      .attach("image", sampleImage);

    expect(res.status).to.equal(200);
    console.log("✅ Dzine Redirect:", res.body.output);
  });

  it("should return redirect URL for Bylo", async () => {
    const res = await request(API_BASE)
      .post("/ghibli")
      .field("provider", "bylo")
      .attach("image", sampleImage);

    expect(res.status).to.equal(200);
    console.log("✅ Bylo Redirect:", res.body.output);
  });

  it("should return redirect URL for Clipfly", async () => {
    const res = await request(API_BASE)
      .post("/ghibli")
      .field("provider", "clipfly")
      .attach("image", sampleImage);

    expect(res.status).to.equal(200);
    console.log("✅ Clipfly Redirect:", res.body.output);
  });
});
