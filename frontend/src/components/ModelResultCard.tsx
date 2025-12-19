import { motion } from "motion/react";
import { Cpu, TrendingUp, Clock, AlertCircle } from "lucide-react";

// --- TİP TANIMLAMALARI ---
// Gelen verinin neye benzediğini tanımlıyoruz
interface Prediction {
  modelName: string;
  confidence: number;
  result: string;
  processingTime?: number;
  modelType?: string;
}

interface ModelResultCardProps {
  prediction: Prediction;
  delay: number;
}

export function ModelResultCard({ prediction, delay }: ModelResultCardProps) {
  // --- GÜVENLİK VE HESAPLAMA BÖLÜMÜ (Crash Prevention) ---
  
  // 1. Veri boşsa varsayılan boş bir obje oluştur (Undefined hatasını önler)
  const safePred = prediction || {};
  
  // 2. Değerleri güvenli bir şekilde al, yoksa 0 veya varsayılan metin ata
  const modelName = safePred.modelName || "Bilinmeyen Model";
  const modelType = safePred.modelType || "Yapay Zeka Modeli";
  const confidence = safePred.confidence || 0;
  const processingTime = safePred.processingTime || 0;
  const resultType = safePred.result || "AI"; // "Human" veya "AI"

  // 3. İhtimalleri Hesapla (Backend'den gelmese bile biz üretelim)
  // Eğer sonuç "Human" ise insan puanı yüksektir, değilse AI puanı yüksektir.
  let aiProbability = 0;
  let humanProbability = 0;

  if (resultType === "Human") {
    humanProbability = confidence;
    aiProbability = 100 - confidence;
  } else {
    aiProbability = confidence;
    humanProbability = 100 - confidence;
  }

  // Hangisi daha baskın? (Renkleri buna göre ayarlayacağız)
  const isAiDominant = aiProbability > humanProbability;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      className="bg-white/90 backdrop-blur-sm rounded-2xl border-2 border-teal-200 overflow-hidden shadow-lg hover:shadow-xl hover:border-teal-300 transition-all"
    >
      {/* --- HEADER KISMI --- */}
      <div className="p-6 border-b-2 border-teal-100 bg-gradient-to-br from-teal-50 to-cyan-50">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            {/* İkon Kutusu */}
            <div className="p-2.5 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-xl shadow-md">
              <Cpu className="w-5 h-5 text-white" />
            </div>
            {/* Başlıklar */}
            <div>
              <h3 className="text-xl font-semibold text-slate-800">{modelName}</h3>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mt-0.5">{modelType}</p>
            </div>
          </div>
        </div>

        {/* --- GENEL GÜVEN SKORU --- */}
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-teal-600" />
              <span className="text-xs font-semibold text-slate-600">Model Güveni</span>
            </div>
            {/* Progress Bar Arkaplanı */}
            <div className="h-2.5 bg-slate-200 rounded-full overflow-hidden border border-slate-300/50">
              {/* Hareketli Bar */}
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${confidence}%` }}
                transition={{ duration: 1, delay: delay + 0.2 }}
                className="h-full bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full shadow-[0_0_10px_rgba(20,184,166,0.3)]"
              />
            </div>
          </div>
          {/* Yüzde Rozeti */}
          <div className="px-3 py-1.5 bg-white border-2 border-teal-200 rounded-lg shadow-sm">
            <span className="text-sm font-bold text-teal-700">%{confidence.toFixed(1)}</span>
          </div>
        </div>
      </div>

      {/* --- DETAYLI TAHMİNLER (AI vs HUMAN) --- */}
      <div className="p-6 space-y-6">
        
        {/* 1. AI Tahmini Bloğu */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className={`w-2.5 h-2.5 rounded-full ${isAiDominant ? 'bg-red-500 animate-pulse' : 'bg-slate-300'}`} />
              <span className="text-sm font-medium text-slate-700">AI Olasılığı</span>
            </div>
            <span className={`text-lg font-bold ${isAiDominant ? 'text-red-600' : 'text-slate-400'}`}>
              %{aiProbability.toFixed(1)}
            </span>
          </div>
          <div className="h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${aiProbability}%` }}
              transition={{ duration: 1, delay: delay + 0.3 }}
              className={`h-full rounded-full ${isAiDominant ? 'bg-gradient-to-r from-red-400 to-rose-600' : 'bg-slate-300'}`}
            />
          </div>
        </div>

        {/* 2. İnsan Tahmini Bloğu */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className={`w-2.5 h-2.5 rounded-full ${!isAiDominant ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
              <span className="text-sm font-medium text-slate-700">İnsan Olasılığı</span>
            </div>
            <span className={`text-lg font-bold ${!isAiDominant ? 'text-emerald-600' : 'text-slate-400'}`}>
              %{humanProbability.toFixed(1)}
            </span>
          </div>
          <div className="h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${humanProbability}%` }}
              transition={{ duration: 1, delay: delay + 0.4 }}
              className={`h-full rounded-full ${!isAiDominant ? 'bg-gradient-to-r from-emerald-400 to-green-600' : 'bg-slate-300'}`}
            />
          </div>
        </div>

        {/* --- FOOTER: İşlem Süresi --- */}
        <div className="pt-4 border-t-2 border-teal-50 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-slate-500">
            <Clock className="w-3.5 h-3.5" />
            <span className="text-xs font-medium">Analiz Süresi</span>
          </div>
          <div className="px-3 py-1 bg-teal-50 border border-teal-200 rounded-full">
            <span className="text-xs font-mono font-semibold text-teal-700">{processingTime.toFixed(0)}ms</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}