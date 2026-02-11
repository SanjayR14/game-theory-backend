const express = require('express');
const cors = require('cors');
const { analyzeHandler } = require('./routes/analyze');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.post('/api/analyze', analyzeHandler);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'chess-decision-support-backend' });
});

app.listen(PORT, () => {
  console.log(`Backend running at http://localhost:${PORT}`);
});
