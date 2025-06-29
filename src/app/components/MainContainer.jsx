"use client";
import { motion } from "framer-motion";

export default function MainContainer({ children }) {
  return (
    <main className="min-h-screen bg-gradient-to-b from-rose-100 to-purple-100 flex flex-col items-center justify-center p-4 overflow-hidden">
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.8 }} 
        className="relative z-10 w-full max-w-3xl mx-auto"
      >
        <motion.div 
          className="bg-white bg-opacity-80 backdrop-blur-sm rounded-3xl shadow-xl shadow-rose-100 p-8 border-2 border-rose-200" 
          initial={{ scale: 0.9 }} 
          animate={{ scale: 1 }}
        >
          {children}
        </motion.div>
      </motion.div>
    </main>
  );
} 