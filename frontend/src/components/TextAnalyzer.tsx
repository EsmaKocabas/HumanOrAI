import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, Cpu, Activity, FileText } from "lucide-react";
import { analysisService } from "../services/AnalysisService";
import { AnalysisResult } from "../types/Analysis";
import { ModelResultCard } from "./ModelResultCard";
import { FinalVerdictCard } from "./FinalVerdictCard";
import { StatsCard } from "./StatsCard";

export function TextAnalyzer() {
  const [text, setText] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (text.trim().length < 10) {
      setError("Lütfen en az 10 karakter uzunluğunda bir metin girin.");
      return;
    }

    setError(null);
    setIsAnalyzing(true);
    setResult(null);

    try {
      const analysisResult = await analysisService.analyzeText(text);
      console.log('Analysis result:', analysisResult);
      console.log('Number of predictions:', analysisResult.predictions.length);
      setResult(analysisResult);
    } catch (err) {
      setError("Analiz sırasında bir hata oluştu. Lütfen tekrar deneyin.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleClear = () => {
    setText("");
    setResult(null);
    setError(null);
  };

  const wordCount = text.trim().split(/\s+/).filter(w => w.length > 0).length;

  return (
    <div className="relative z-10 container mx-auto px-4 py-10 max-w-7xl">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-12"
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border-2 border-teal-200 shadow-sm mb-6"
        >
          <Sparkles className="w-4 h-4 text-teal-600" />
          <span className="text-sm text-teal-700">AIorHuman Text Detector</span>
        </motion.div>
        
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-6xl mb-4 bg-gradient-to-r from-teal-600 via-cyan-600 to-sky-600 bg-clip-text text-transparent"
        >
          AI / İnsan Metin Tespiti
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-medium text-slate-600 max-w-3xl mx-auto"
        >
          Metninizi 5 farklı yapay zeka modeliyle analiz edin ve kim tarafından yazıldığını tespit edin.
        </motion.p>
      </motion.div>

      {/* Input Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
        className="bg-white/90 backdrop-blur-sm rounded-3xl border-2 border-teal-200 shadow-xl p-8 mb-10"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-xl shadow-md">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-3xl text-slate-800">Metin Girişi</h2>
        </div>
        
        <div className="relative">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Analiz etmek istediğiniz metni buraya yazın veya yapıştırın..."
            className="w-full h-48 p-5 bg-slate-50 border-2 border-teal-100 rounded-2xl focus:border-teal-400 focus:ring-4 focus:ring-teal-100 outline-none transition-all resize-none text-slate-800 placeholder:text-slate-400"
            disabled={isAnalyzing}
          />
          
          {/* Character counter */}
          <div className="absolute bottom-4 right-4 flex items-center gap-3">
            <div className="px-3 py-1.5 bg-white/90 backdrop-blur-sm rounded-lg border border-teal-200 text-sm text-slate-600">
              <span className="text-teal-600">{text.length}</span> karakter
            </div>
            <div className="px-3 py-1.5 bg-white/90 backdrop-blur-sm rounded-lg border border-teal-200 text-sm text-slate-600">
              <span className="text-cyan-600">{wordCount}</span> kelime
            </div>
          </div>
        </div>
        
        <div className="flex items-center justify-between mt-6">
          <div className="flex items-center gap-3">
            {text.length >= 10 && !result && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-2 px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-lg"
              >
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-sm text-emerald-700">Analiz için hazır</span>
              </motion.div>
            )}
            {result && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-2 px-3 py-2 bg-teal-50 border border-teal-200 rounded-lg"
              >
                <div className="w-2 h-2 bg-teal-500 rounded-full" />
                <span className="text-sm text-teal-700">Analiz edildi</span>
              </motion.div>
            )}
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={handleClear}
              disabled={isAnalyzing || text.length === 0}
              className="px-6 py-3 rounded-xl bg-slate-100 border-2 border-slate-200 hover:bg-slate-200 hover:border-slate-300 transition-all disabled:opacity-40 disabled:cursor-not-allowed text-slate-700"
            >
              Temizle
            </button>
            <motion.button
              onClick={handleAnalyze}
              disabled={isAnalyzing || text.length < 10 || result !== null}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-10 py-3 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white rounded-xl shadow-lg shadow-teal-200 hover:shadow-teal-300 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isAnalyzing ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Analiz Ediliyor...
                </>
              ) : (
                <>
                  <Activity className="w-5 h-5" />
                  Analizi Başlat
                </>
              )}
            </motion.button>
          </div>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-5 p-4 bg-red-50 border-2 border-red-200 rounded-xl text-red-700 flex items-center gap-3"
          >
            <div className="w-2 h-2 bg-red-500 rounded-full" />
            {error}
          </motion.div>
        )}
      </motion.div>

      {/* Results Section */}
      <AnimatePresence mode="wait">
        {isAnalyzing && (
          <motion.div
            key="loading"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white/90 backdrop-blur-sm rounded-3xl border-2 border-teal-200 shadow-xl p-12 text-center"
          >
            <div className="relative inline-block mb-8">
              <div className="w-20 h-20 border-4 border-teal-100 rounded-full" />
              <div className="absolute inset-0 w-20 h-20 border-4 border-transparent border-t-teal-500 rounded-full animate-spin" />
              <div className="absolute inset-2 w-16 h-16 border-4 border-transparent border-t-cyan-500 rounded-full animate-spin" style={{ animationDuration: '1.5s', animationDirection: 'reverse' }} />
            </div>
            <h3 className="text-3xl mb-3 text-slate-800">Modeller Çalışıyor</h3>
            <p className="text-lg text-slate-600 mb-8">5 yapay zeka modeli metninizi analiz ediyor...</p>
            
            <div className="flex justify-center gap-4 flex-wrap">
              {['GPT-Detector', 'LSTM-Analyzer', 'BERT-Checker', 'Model-4', 'Model-5'].map((model, i) => (
                <motion.div
                  key={model}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.2 }}
                  className="px-4 py-2 bg-teal-50 border-2 border-teal-200 rounded-xl text-sm text-teal-700"
                >
                  <div className="w-2 h-2 bg-teal-500 rounded-full animate-pulse mx-auto mb-2" />
                  {model}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {result && !isAnalyzing && (
          <motion.div
            key="results"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Stats Overview */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="grid grid-cols-2 gap-5 mb-10"
            >
              <StatsCard
                icon={Activity}
                label="AI Tespit Oranı"
                value={`${result.averageAiProbability.toFixed(1)}%`}
                color="from-red-400 to-rose-500"
                delay={0.15}
              />
              <StatsCard
                icon={Sparkles}
                label="İnsan Tespit Oranı"
                value={`${result.averageHumanProbability.toFixed(1)}%`}
                color="from-emerald-400 to-green-500"
                delay={0.2}
              />
            </motion.div>

            {/* Final Verdict */}
            <FinalVerdictCard result={result} />

            {/* Model Results */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div className="flex items-center gap-3 mb-8">
                <div className="p-2.5 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-xl shadow-md">
                  <Cpu className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-4xl text-slate-800">Model Tahminleri</h2>
              </div>
              
              <div className="space-y-10">
                {/* İlk 3 model - üst satır */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  {result.predictions.slice(0, 3).map((prediction, index) => (
                    <ModelResultCard
                      key={prediction.modelName}
                      prediction={prediction}
                      delay={0.5 + index * 0.1}
                    />
                  ))}
                </div>
                {/* Son 2 model - alt satır, soldan başlayarak */}
                {result.predictions.length > 3 && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {result.predictions.slice(3, 5).map((prediction, index) => (
                      <ModelResultCard
                        key={prediction.modelName}
                        prediction={prediction}
                        delay={0.8 + index * 0.1}
                      />
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}