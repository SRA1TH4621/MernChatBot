// controllers/weatherController.js
const axios = require("axios");

const getWeather = async (req, res) => {
  try {
    const { city } = req.query;
    if (!city) {
      return res.status(400).json({ error: "City is required" });
    }

    const apiKey = process.env.WEATHER_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "Missing WEATHER_API_KEY in .env" });
    }

    const url = `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${encodeURIComponent(
      city
    )}&aqi=no`;

    const response = await axios.get(url);

    const data = response.data;
    res.json({
      location: data.location.name,
      region: data.location.region,
      country: data.location.country,
      temperature_c: data.current.temp_c,
      temperature_f: data.current.temp_f,
      condition: data.current.condition.text,
      icon: data.current.condition.icon,
      feelslike_c: data.current.feelslike_c,
      humidity: data.current.humidity,
      wind_kph: data.current.wind_kph,
    });
  } catch (error) {
    console.error("Weather API Error:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });
    res.status(500).json({ error: "Failed to fetch weather data" });
  }
};

module.exports = { getWeather };
