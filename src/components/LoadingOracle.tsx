import { motion } from "framer-motion";

export function LoadingOracle() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        className="w-32 h-32"
      >
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <circle cx="50" cy="50" r="48" fill="#1a0000" stroke="#d4af37" strokeWidth="2" />
          <path
            d="M50,2 A48,48 0 0,1 50,98 A24,24 0 0,1 50,50 A24,24 0 0,0 50,2 Z"
            fill="#d4af37"
          />
          <circle cx="50" cy="26" r="6" fill="#1a0000" />
          <circle cx="50" cy="74" r="6" fill="#d4af37" />
        </svg>
      </motion.div>
      <motion.p
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="text-amber-200 font-serif text-lg tracking-wide"
      >
        ซินแสกำลังพิจารณาโหงวเฮ้ง...
      </motion.p>
    </div>
  );
}
