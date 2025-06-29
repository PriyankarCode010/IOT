"use client";
import { AnimatePresence } from "framer-motion";
import { useEffect } from "react";
import Loader from './components/Loader';
import Countdown from './components/Countdown';
import BirthdayCelebration from './components/BirthdayCelebration';
import Confetti from './components/Confetti';
import FloatingHearts from './components/FloatingHearts';
import BubbleAnimation from './components/BubbleAnimation';
import StartButton from './components/StartButton';
import MainContainer from './components/MainContainer';
import { useBirthdayApp } from './hooks/useBirthdayApp';

export default function Home() {
  // Force re-render on every mount
  const renderKey = Date.now();
  
  console.log("🔄 Home component rendering...", renderKey);
  
  const {
    isBirthday,
    isLoading,
    showForYouBtn,
    birthdayDate,
    audioRef,
    startCelebration,
    handleCountdownEnd,
  } = useBirthdayApp();

  console.log("🎉 Is birthday:", isBirthday);
  console.log("⏳ Is loading:", isLoading);
  console.log("🔘 Show button:", showForYouBtn);

  useEffect(() => {
    console.log("🚀 Home component mounted!", renderKey);
    
    // Force a re-render after mount to ensure fresh data
    const timer = setTimeout(() => {
      console.log("🔄 Forced re-render check");
    }, 100);
    
    return () => clearTimeout(timer);
  }, [renderKey]);

  if (isLoading) {
    console.log("⏳ Showing loader...");
    return <Loader />;
  }

  console.log("🎨 Rendering birthday celebration...");

  return (
    <MainContainer>
      {isBirthday && <Confetti />}
      <FloatingHearts />
      <BubbleAnimation />
      <AnimatePresence mode="wait">
        {isBirthday ? (
          <BirthdayCelebration key="celebration" />
        ) : (
          <Countdown
            key="countdown"
            targetDate={birthdayDate}
            onCountdownEnd={handleCountdownEnd}
          />
        )}
      </AnimatePresence>
      {showForYouBtn && <StartButton onStart={startCelebration} />}
      <audio ref={audioRef} src="/birthday.mp3" preload="auto" loop />
    </MainContainer>
  );
}
