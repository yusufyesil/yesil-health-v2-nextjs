import { Brain } from 'lucide-react';
import { motion } from 'framer-motion';

export function ThinkingIndicator() {
  return (
    <div className="flex items-center gap-2 text-gray-500">
      <motion.div
        animate={{
          scale: [1, 1.1, 1],
          opacity: [1, 0.7, 1],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <Brain className="h-5 w-5" />
      </motion.div>
      <motion.span
        animate={{ opacity: [1, 0.7, 1] }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="text-sm font-medium"
      >
        Yesil AI is thinking on consultations...
      </motion.span>
    </div>
  );
} 