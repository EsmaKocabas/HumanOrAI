exports.getPrediction = async (text) => {
  const length = text.length;

  return {
    model_1: {
      human_score: Math.min(90, 50 + (length % 10)),
      ai_score: Math.min(90, 50 + (length % 10)),
    },
    model_2: {
      human_score: Math.min(90, 50 + (length % 10)),
      ai_score: Math.min(90, 50 + (length % 10)),
    },
    model_3: {
      human_score: Math.min(90, 50 + (length % 10)),
      ai_score: Math.min(90, 50 + (length % 10)),
    },
    model_4: {
      human_score: Math.min(90, 50 + (length % 10)),
      ai_score: Math.min(90, 50 + (length % 10)),
    },
    model_5: {
      human_score: Math.min(90, 50 + (length % 10)),
      ai_score: Math.min(90, 50 + (length % 10)),
    },
  };
};
