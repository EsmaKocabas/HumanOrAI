const mlServices = require('../services/mlService');

exports.predictText = async (req, res) => {
  const { text } = req.body;

  if (!text || !text.trim()) {
    return res.status(400).json({ message: 'Text is required' });
  }

  try {
    // Python ML API'den tahmin al
    const prediction = await mlServices.getPrediction(text);

    // Python API'den gelen predictions array'ini formatla
    const formattedPredictions = (prediction.predictions || []).map((pred) => ({
      modelName: pred.modelName || 'Bilinmeyen Model',
      modelType: 'Yapay Zeka Modeli',
      confidence: pred.confidence || 0,
      result: pred.result || 'AI',
      aiProbability: pred.aiProbability || 0,
      humanProbability: pred.humanProbability || 0,
      processingTime: pred.processingTime || 0
    }));

    // Python API'den gelen veriyi frontend formatına uyarla
    return res.json({
      text: text,
      result: prediction.result || prediction.finalVerdict || 'Bilinmiyor',
      finalVerdict: prediction.finalVerdict || prediction.result || 'Bilinmiyor',
      averageAiProbability: prediction.averageAiProbability || 0,
      averageHumanProbability: prediction.averageHumanProbability || 0,
      predictions: formattedPredictions,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Prediction failed:', error);
    return res.status(500).json({ 
      message: 'Prediction failed',
      error: error.message 
    });
  }
};
