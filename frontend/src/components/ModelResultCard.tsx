import { motion } from "motion/react";
import { Cpu } from "lucide-react";

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
      </div>

      {/* --- DETAYLI TAHMİNLER (AI vs HUMAN) --- */}
      <div className="p-6 space-y-6">
        
        {/* 1. AI Tahmini Bloğu */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
              <span className="text-sm font-medium text-slate-700">AI Olasılığı</span>
            </div>
            <span className="text-lg font-bold text-red-600">
              %{aiProbability.toFixed(1)}
            </span>
          </div>
          <div className="h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${aiProbability}%` }}
              transition={{ duration: 1, delay: delay + 0.3 }}
              className="h-full rounded-full bg-red-500"
            />
          </div>
        </div>

        {/* 2. İnsan Tahmini Bloğu */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-sm font-medium text-slate-700">İnsan Olasılığı</span>
            </div>
            <span className="text-lg font-bold text-emerald-600">
              %{humanProbability.toFixed(1)}
            </span>
          </div>
          <div className="h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${humanProbability}%` }}
              transition={{ duration: 1, delay: delay + 0.4 }}
              className="h-full rounded-full bg-emerald-500"
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}