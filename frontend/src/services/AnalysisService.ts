
import type { AnalysisResult } from '@/types/Analysis'

class AnalysisService {
  private static instance: AnalysisService

  private constructor() {
    // Singleton
  }

  public static getInstance(): AnalysisService {
    if (!AnalysisService.instance) {
      AnalysisService.instance = new AnalysisService()
    }
    return AnalysisService.instance
  }

    // Frontend → Backend API çağrısı
  public async analyzeText(text: string): Promise<AnalysisResult> {
    if (!text?.trim()) {
      throw new Error('Text cannot be empty')
    }

    const response = await fetch('/api/predict', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
    })

    if (!response.ok) {
      const errorMessage = await response.text()
      throw new Error(errorMessage || 'Prediction request failed')
    }

    const data: AnalysisResult = await response.json()

    return data
  }
}

//singleton nesnesini döndürür.
export const analysisService = AnalysisService.getInstance()
