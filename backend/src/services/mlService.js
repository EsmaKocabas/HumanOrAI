const axios = require('axios'); //api istekleri yapmak için axios 

exports.getPrediction = async (text) => {
  const lenght = text.length;

  return {
    model_1: {
        human_score: Math.min(90,50 + lenght % 10),
        ai_score: Math.min(90,50 + lenght % 10),
    },
    model_2: {
        human_score: Math.min(90,50 + lenght % 10),
        ai_score: Math.min(90,50 + lenght % 10),
    },
    model_3: {
        human_score: Math.min(90,50 + lenght % 10),
        ai_score: Math.min(90,50 + lenght % 10),
    },
  }
};