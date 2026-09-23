const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;
const VERSION = process.env.VERSION || '1.0.0';

app.get('/', (req, res) => {
    res.send(`<h1>Node.js Application</h1><p>Version: ${VERSION}</p>`);
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});