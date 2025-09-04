const axios = require("axios");

exports.getNews = async (req, res) => {
  try {
    const { query = "top", lang = "en", pageSize = 8 } = req.query;

    const apiKey = process.env.NEWS_API_KEY;
    if (!apiKey) return res.status(500).json({ error: "NEWS_API_KEY missing" });

    let url, params;
    if (query.toLowerCase() === "top") {
      url = "https://newsapi.org/v2/top-headlines";
      params = { language: lang, pageSize, apiKey };
    } else {
      url = "https://newsapi.org/v2/everything";
      params = {
        q: query,
        language: lang,
        sortBy: "publishedAt",
        pageSize,
        apiKey,
      };
    }

    const resp = await axios.get(url, { params });
    const articles = (resp.data.articles || []).map((a) => ({
      title: a.title,
      description: a.description,
      url: a.url,
      image: a.urlToImage,
      source: a.source?.name,
      publishedAt: a.publishedAt,
    }));

    res.json({ query, total: articles.length, articles });
  } catch (err) {
    console.error("News API error:", err.message);
    res.status(500).json({ error: "Failed to fetch news" });
  }
};
