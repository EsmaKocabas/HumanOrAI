const express = require('express'); 
const cors = require('cors');
const predictController = require('./controllers/predictController');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.json({ message: 'HumanOrAI API is running', endpoints: { predict: '/api/predict' } });
});

// ML Service üzerinden Python API'ye bağlanan endpoint
app.post('/api/predict', predictController.predictText);



module.exports = app;