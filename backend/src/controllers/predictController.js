const mlServices = require('../services/mlService');

exports.predictText = async (req, res) => {
  const { text } = req.body;

  if (!text || !text.trim()) {
    return res.status(400).json({ message: 'Text is required' });
  }

  try {
    const rawPrediction = await mlServices.getPrediction(text);

    // model sonuçlarını frontend formatına çevir
    const predictions = [
      {
        modelName: 'Model-1',
        modelType: 'Statistical Classifier',
        aiProbability: rawPrediction.model_1.ai_score,
        humanProbability: rawPrediction.model_1.human_score,
        confidence: 85,
        processingTime: 300,
      },
      {
        modelName: 'Model-2',
        modelType: 'Pattern Analyzer',
        aiProbability: rawPrediction.model_2.ai_score,
        humanProbability: rawPrediction.model_2.human_score,
        confidence: 82,
        processingTime: 420,
      },
      {
        modelName: 'Model-3',
        modelType: 'Semantic Model',
        aiProbability: rawPrediction.model_3.ai_score,
        humanProbability: rawPrediction.model_3.human_score,
        confidence: 88,
        processingTime: 390,
      },
      {
        modelName: 'Model-4',
        modelType: 'Neural Network Classifier',
        aiProbability: rawPrediction.model_4.ai_score,
        humanProbability: rawPrediction.model_4.human_score,
        confidence: 83,
        processingTime: 350,
      },
      {
        modelName: 'Model-5',
        modelType: 'Transformer-Based Analyzer',
        aiProbability: rawPrediction.model_5.ai_score,
        humanProbability: rawPrediction.model_5.human_score,
        confidence: 86,
        processingTime: 380,
      },
    ];

    const avgAi =
      predictions.reduce((sum, p) => sum + p.aiProbability, 0) /
      predictions.length;

    const avgHuman =
      predictions.reduce((sum, p) => sum + p.humanProbability, 0) /
      predictions.length;

    const finalVerdict = avgAi > avgHuman ? 'AI' : 'HUMAN';

    return res.json({
      text,
      predictions,
      averageAiProbability: Math.round(avgAi * 100) / 100,
      averageHumanProbability: Math.round(avgHuman * 100) / 100,
      finalVerdict,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Prediction failed:', error);
    return res.status(500).json({ message: 'Prediction failed' });
  }
};
