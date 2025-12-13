const express = require('express');
const cors = require('cors'); //isteklere izin vermek için CORS 
const predictRoutes = require("./routes/predictRoutes");


const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.json({ message: 'HumanOrAI API is running', endpoints: { predict: '/api/predict' } });
});

app.use("/api/predict", predictRoutes);

module.exports = app;

