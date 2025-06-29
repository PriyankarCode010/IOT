"use client";
import { motion } from "framer-motion";
import { PartyPopper, MoveRight } from "lucide-react";

export default function StartButton({ onStart }) {
  return (
    <motion.div 
      key="start-button" 
      className="flex flex-col items-center justify-center mt-8" 
      initial={{ opacity: 0, y: -30 }} 
      animate={{ opacity: 1, y: 0 }} 
      exit={{ opacity: 0 }}
    >
      <motion.button 
        onClick={onStart} 
        className="bg-gradient-to-r z-10 from-pink-500 to-purple-500 shadow-lg hover:shadow-xl transition-all rounded-full font-medium text-white py-4 px-8 cursor-pointer border-2 border-white flex items-center gap-3" 
        whileTap={{ scale: 0.95 }} 
        animate={{ y: [0, -5, 0], scale: [1, 1.03, 1] }} 
        transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
      >
        <PartyPopper className="w-6 h-6" />
        <span className="text-xl">For you</span>
        <MoveRight className="w-5 stroke-3 h-6" />
      </motion.button>
    </motion.div>
  );
} 