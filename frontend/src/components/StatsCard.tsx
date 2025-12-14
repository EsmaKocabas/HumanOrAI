import { motion } from "motion/react";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  color: string;
  delay: number;
}

export function StatsCard({ icon: Icon, label, value, color, delay }: StatsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      whileHover={{ y: -4 }}
      className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border-2 border-teal-200 shadow-lg hover:shadow-xl hover:border-teal-300 transition-all"
    >
      <div className="flex items-center gap-4">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: delay + 0.2, type: "spring", stiffness: 200 }}
          className={`p-3.5 bg-gradient-to-br ${color} rounded-xl shadow-md`}
        >
          <Icon className="w-6 h-6 text-white" />
        </motion.div>
        <div>
          <div className="text-sm text-slate-600 mb-1">{label}</div>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: delay + 0.3 }}
            className="text-3xl text-slate-800"
          >
            {value}
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}