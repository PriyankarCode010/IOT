"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function BubbleAnimation() {
  const [bubbles, setBubbles] = useState([]);

  useEffect(() => {
    const generated = Array.from({ length: 20 }).map(() => ({
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      color: ["bg-pink-300", "bg-purple-300", "bg-yellow-300", "bg-violet-300", "bg-rose-300"][Math.floor(Math.random() * 3)],
      size: 16 + Math.floor(Math.random() * 8),
      duration: 3 + Math.random() * 2,
      delay: Math.random() * 5
    }));
    setBubbles(generated);
  }, []);

  return (
    <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-0 overflow-hidden">
      {bubbles.map((bubble, i) => (
        <motion.div 
          key={i} 
          className="absolute" 
          style={{ left: bubble.left, top: bubble.top }} 
          animate={{ y: [0, -20, 0], scale: [1, 1.1, 1] }} 
          transition={{ duration: bubble.duration, repeat: Infinity, delay: bubble.delay }}
        >
          <div 
            className={`rounded-full ${bubble.color} opacity-60`} 
            style={{ width: `${bubble.size}px`, height: `${bubble.size}px` }} 
          />
        </motion.div>
      ))}
    </div>
  );
} 