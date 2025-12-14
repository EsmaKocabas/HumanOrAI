/**
 * Backend /api/predict endpoint'inden dönen
 * analiz sonucunun tip tanımları
 */

export type Verdict = 'AI' | 'HUMAN'

export interface Prediction {
  modelName: string
  modelType: string
  aiProbability: number
  humanProbability: number
  confidence: number
  processingTime: number
}

export interface AnalysisResult {
  text: string
  predictions: Prediction[]
  averageAiProbability: number
  averageHumanProbability: number
  finalVerdict: Verdict
  timestamp: string // backend json gönderdiği için string alınır
}
