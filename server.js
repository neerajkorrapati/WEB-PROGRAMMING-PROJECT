const express = require('express');
const axios = require('axios');
const cors = require('cors');
const path = require('path');

const app = express();

// Enable CORS
app.use(cors());

// Serve static frontend files (VERY IMPORTANT FIX)
app.use(express.static(__dirname));

// Replace with your actual Alpha Vantage API Key
const API_KEY = '8FWA7HH14Q4WCMCK';

app.get('/stock/:symbol', async (req, res) => {
    try {
        const ticker = req.params.symbol.toUpperCase();

        const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${ticker}&apikey=${API_KEY}`;

        const response = await axios.get(url);

        if (response.data.Note) {
            return res.status(429).json({ error: "API limit reached" });
        }

        res.json(response.data);

    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: "Failed to fetch stock data" });
    }
});

const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});