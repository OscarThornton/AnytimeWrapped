const express = require('express');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// Serve HTML files from the "public/html" directory
app.get('/:page', (req, res) => {
    const page = req.params.page;
    res.sendFile(path.join(__dirname, 'public', 'html', `${page}.html`));
});

// Endpoint to get Spotify client ID
app.get('/api/spotify-client-id', (req, res) => {
    res.json({ clientId: process.env.SPOTIFY_CLIENT_ID });
});

// Endpoint to get Spotify client ID
app.get('/api/spotify-client-secret', (req, res) => {
    res.json({ clientSecret: process.env.SPOTIFY_CLIENT_SECRET });
});

// Default route to serve the home page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'html', 'index.html'));
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
