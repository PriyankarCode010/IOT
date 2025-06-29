"use client";
import { useState, useEffect, useRef } from "react";
import { getNextJuly10 } from "../utils/dateUtils";

export function useBirthdayApp() {
  console.log("🎣 useBirthdayApp hook called");
  
  const [isBirthday, setIsBirthday] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showForYouBtn, setShowForYouBtn] = useState(false);
  const audioRef = useRef(null);
  const birthdayDate = getNextJuly10();
  
  console.log("🎉 Hook - Starting with birthday celebration");
  
  useEffect(() => {
    console.log("⏰ Hook - Setting up loading timer");
    setTimeout(() => {
      console.log("✅ Hook - Loading finished");
      setIsLoading(false);
    }, 1500);
  }, []);
  
  const startCelebration = () => {
    console.log("🎉 Hook - Starting celebration");
    setShowForYouBtn(false);
    setIsBirthday(true);
    if (audioRef.current) {
      audioRef.current.volume = 0.8;
      audioRef.current.play().catch((e) => {
        console.log("Autoplay prevented, user interaction needed", e);
      });
    }
  };
  
  const handleCountdownEnd = () => {
    console.log("🔘 Hook - Countdown ended, showing button");
    setShowForYouBtn(true);
  };
  
  console.log("🔄 Hook - Returning values:", { isBirthday, isLoading, showForYouBtn });
  
  return {
    isBirthday,
    isLoading,
    showForYouBtn,
    birthdayDate,
    audioRef,
    startCelebration,
    handleCountdownEnd,
  };
} 