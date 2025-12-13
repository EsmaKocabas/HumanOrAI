const mlServices = require('../services/mlService');


//text alıp prediction yapan controller
exports.predictText = async (req, res) => {
    const { text } = req.body;
   
    if(!text) {
        return res.status(400).json({ message: 'Text is required' });
    }

    try {
        const result = await mlServices.getPrediction(text);
        res.json(result)
    } catch (error) {
        res.status(500).json({ message: 'Prediction failed' });
    }
};