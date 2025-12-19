import { motion } from "motion/react";
import { Shield, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";

export function FinalVerdictCard({ result }: { result: any }) {
  // --- GÜVENLİK KONTROLÜ ---
  if (!result) return null;

  // Sonucu al (Human/AI)
  const rawVerdict = result.finalVerdict || result.result || "AI";
  const normalizedVerdict = rawVerdict.toString().toUpperCase() === "HUMAN" ? "HUMAN" : "AI";

  // --- DÜZELTME BURADA ---
  // Eskiden: Veri yoksa %95 uyduruyorduk.
  // Şimdi: Veri yoksa direkt 0 basıyoruz.
  const aiProb = result.averageAiProbability || 0;
  const humanProb = result.averageHumanProbability || 0;
  
  const predictions = result.predictions || [];

  // --- TASARIM AYARLARI ---
  const getVerdictConfig = () => {
    switch (normalizedVerdict) {
      case 'AI':
        return {
          icon: XCircle,
          title: 'AI Tarafından Üretilmiş',
          subtitle: 'Yapay Zeka Tespit Edildi',
          description: 'Analiz sonuçları bu metnin yapay zeka tarafından oluşturulduğunu göstermektedir.',
          bgGradient: 'from-red-50 to-rose-50',
          borderColor: 'border-red-300',
          iconColor: 'text-red-600',
          iconBg: 'from-red-500 to-rose-500'
        };
      case 'HUMAN':
        return {
          icon: CheckCircle2,
          title: 'İnsan Tarafından Yazılmış',
          subtitle: 'İnsan Yazımı Tespit Edildi',
          description: 'Analiz sonuçları bu metnin bir insan tarafından yazıldığını göstermektedir.',
          bgGradient: 'from-emerald-50 to-green-50',
          borderColor: 'border-emerald-300',
          iconColor: 'text-emerald-600',
          iconBg: 'from-emerald-500 to-green-500'
        };
      default:
        return {
          icon: AlertTriangle,
          title: 'Analiz Tamamlandı',
          subtitle: 'Sonuç Belirlendi',
          description: 'Metin analizi tamamlandı.',
          bgGradient: 'from-slate-50 to-gray-50',
          borderColor: 'border-slate-300',
          iconColor: 'text-slate-600',
          iconBg: 'from-slate-500 to-gray-500'
        };
    }
  };

  const config = getVerdictConfig();
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.35, duration: 0.5 }}
      className={`bg-gradient-to-br ${config.bgGradient} rounded-3xl p-10 mb-10 border-2 ${config.borderColor} shadow-xl`}
    >
      <div className="flex items-start gap-6 mb-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
          className={`p-4 bg-gradient-to-br ${config.iconBg} rounded-2xl shadow-lg`}
        >
          <Icon className="w-10 h-10 text-white" />
        </motion.div>
        
        <div className="flex-1">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            className="flex items-center gap-3 mb-2"
          >
            <h2 className="text-4xl text-slate-800">{config.title}</h2>
            <div className="px-4 py-1.5 bg-white border-2 border-teal-300 rounded-full text-sm text-teal-700 shadow-sm">
              Son Karar
            </div>
          </motion.div>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="text-sm text-slate-600 mb-3"
          >
            {config.subtitle}
          </motion.p>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-lg text-slate-700"
          >
            {config.description}
          </motion.p>
        </div>
      </div>

      {/* Yüzde Göstergeleri */}
      <div className="grid grid-cols-2 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border-2 border-red-200"
        >
          <div className="flex items-center gap-2 mb-3">
            <div className="w-3 h-3 bg-red-500 rounded-full" />
            <div className="text-sm text-slate-600">AI Olasılığı</div>
          </div>
          <div className="text-5xl text-red-600 mb-3">
            {aiProb.toFixed(1)}%
          </div>
          <div className="h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${aiProb}%` }}
              transition={{ duration: 1, delay: 1 }}
              className="h-full bg-gradient-to-r from-red-400 to-rose-500 rounded-full"
            />
          </div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border-2 border-emerald-200"
        >
          <div className="flex items-center gap-2 mb-3">
            <div className="w-3 h-3 bg-emerald-500 rounded-full" />
            <div className="text-sm text-slate-600">İnsan Olasılığı</div>
          </div>
          <div className="text-5xl text-emerald-600 mb-3">
            {humanProb.toFixed(1)}%
          </div>
          <div className="h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${humanProb}%` }}
              transition={{ duration: 1, delay: 1.1 }}
              className="h-full bg-gradient-to-r from-emerald-400 to-green-500 rounded-full"
            />
          </div>
        </motion.div>
      </div>

      {/* Detaylı Modeller */}
      {predictions.length > 0 && (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
            className="bg-white/50 backdrop-blur-sm rounded-2xl p-6 border-2 border-teal-200"
        >
            <div className="flex items-center gap-2 mb-4">
            <Shield className="w-5 h-5 text-teal-600" />
            <span className="text-sm text-slate-700">Model Uzlaşması</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {predictions.map((pred: any, index: number) => {
                // BURADA DA UYDURMAYI KALDIRDIK
                const pAi = pred.aiProbability || 0;
                const pHuman = pred.humanProbability || 0;
                
                // Uyum kontrolü
                let modelAgrees = false;
                if (normalizedVerdict === 'AI') {
                    modelAgrees = pAi > pHuman;
                } else {
                    modelAgrees = pHuman > pAi;
                }

                return (
                <motion.div
                    key={pred.modelName || index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 1.3 + index * 0.1 }}
                    className={`px-4 py-3 rounded-xl text-center border-2 ${
                    modelAgrees
                        ? 'bg-teal-50 border-teal-300'
                        : 'bg-white/50 border-slate-200'
                    }`}
                >
                    <div className="text-sm text-slate-700 mb-1">{pred.modelName || "Model"}</div>
                    {modelAgrees ? (
                    <div className="text-xs text-teal-600 flex items-center justify-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        Uyumlu
                    </div>
                    ) : (
                    <div className="text-xs text-slate-500">Farklı Görüş</div>
                    )}
                </motion.div>
                );
            })}
            </div>
        </motion.div>
      )}
    </motion.div>
  );
}