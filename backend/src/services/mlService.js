const axios = require('axios');

const PYTHON_API_URL = 'http://127.0.0.1:5001/predict';

exports.getPrediction = async (text) => {
  if (!text || text.trim().length < 2) {
    throw new Error('Text must be at least 2 characters long');
  }

  try {
    // Python ML API'ye istek gönder
    const response = await axios.post(PYTHON_API_URL, {
      text: text
    });

    console.log("🐍 Python ML API cevabı:", response.data);

    // Python API'den gelen veriyi döndür
    return response.data;
  } catch (error) {
    console.error("❌ Python ML API hatası:", error.message);
    
    // Hata durumunda fallback olarak mock data döndür
    if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
      console.warn("⚠️ Python API'ye ulaşılamadı, mock data döndürülüyor");
      const length = text.length;
      // Uzun metinler genelde AI, kısa metinler genelde Human olabilir (eşit değil!)
      const aiProb = Math.min(85, 60 + (length % 15));
      const humanProb = 100 - aiProb;
      return {
        result: "Bilinmiyor",
        finalVerdict: "Bilinmiyor",
        averageAiProbability: aiProb,
        averageHumanProbability: humanProb,
        predictions: []
      };
    }
    
    throw error;
  }
};
