const axios = require('axios');
const express = require('express'); 
const cors = require('cors');


// const predictRoutes = require("./routes/predictRoutes"); 

const app = express();

app.use(cors());
app.use(express.json());


app.get('/', (req, res) => {
    res.json({ message: 'HumanOrAI API is running', endpoints: { predict: '/api/predict' } });
});


app.post('/api/predict', async (req, res) => {
    // Frontend'den gelen veriyi al
    const { text, model } = req.body;

    console.log("🌐 Frontend'den gelen:", text, "| Model:", model);

    try {
     
        const response = await axios.post('http://127.0.0.1:5001/predict', {
            text: text,
            model: model || 'random_forest'
        });

        console.log("🐍 Python cevabı:", response.data);
       
        res.json(response.data);

    } catch (error) {
        console.error("❌ HATA:", error.message);
    
        res.status(500).json({ 
            result: "Hata", 
            message: "Yapay zeka servisine ulaşılamadı.",
            details: error.message
        });
    }
});



module.exports = app;