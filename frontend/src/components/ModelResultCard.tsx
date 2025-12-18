import { motion } from "motion/react";
import { Prediction } from "../types/Analysis";
import { Cpu } from "lucide-react";

interface ModelResultCardProps {
  prediction: Prediction;
  delay: number;
}

export function ModelResultCard({ prediction, delay }: ModelResultCardProps) {
  const isAiDominant = prediction.aiProbability > prediction.humanProbability;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      className="bg-white/90 backdrop-blur-sm rounded-2xl border-2 border-teal-200 overflow-hidden shadow-lg hover:shadow-xl hover:border-teal-300 transition-all"
    >
      {/* Header */}
      <div className="p-6 border-b-2 border-teal-100 bg-gradient-to-br from-teal-50 to-cyan-50 mb-6">
        <div className="flex items-start justify-between mb-1">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-xl shadow-md">
              <Cpu className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-xl text-slate-800">{prediction.modelName}</h3>
              <p className="text-sm text-slate-600 mt-0.5">{prediction.modelType}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Predictions */}
      <div className="p-6 space-y-5">
        {/* AI Prediction */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 bg-red-500 rounded-full" />
              <span className="text-sm text-slate-700">AI Tarafından Yazıldı</span>
            </div>
            <span className={`text-xl ${isAiDominant ? 'text-red-600' : 'text-slate-400'}`}>
              {prediction.aiProbability.toFixed(1)}%
            </span>
          </div>
          <div className="h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${prediction.aiProbability}%` }}
              transition={{ duration: 1, delay: delay + 0.3 }}
              className="h-full bg-gradient-to-r from-red-400 to-rose-500 rounded-full"
            />
          </div>
        </div>

        {/* Human Prediction */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full" />
              <span className="text-sm text-slate-700">İnsan Tarafından Yazıldı</span>
            </div>
            <span className={`text-xl ${!isAiDominant ? 'text-emerald-600' : 'text-slate-400'}`}>
              {prediction.humanProbability.toFixed(1)}%
            </span>
          </div>
          <div className="h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${prediction.humanProbability}%` }}
              transition={{ duration: 1, delay: delay + 0.4 }}
              className="h-full bg-gradient-to-r from-emerald-400 to-green-500 rounded-full"
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}