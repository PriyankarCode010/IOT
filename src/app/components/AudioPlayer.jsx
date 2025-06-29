"use client";
import { useRef } from "react";

export default function AudioPlayer() {
  const audioRef = useRef(null);

  const playAudio = () => {
    if (audioRef.current) {
      audioRef.current.volume = 0.8;
      audioRef.current.play().catch((e) => {
        console.log("Autoplay prevented, user interaction needed", e);
      });
    }
  };

  return (
    <>
      <audio ref={audioRef} src="/birthday.mp3" preload="auto" loop />
      {/* Expose playAudio method via ref for parent component */}
      <div style={{ display: 'none' }} ref={(el) => {
        if (el) {
          el.playAudio = playAudio;
        }
      }} />
    </>
  );
}

// Custom hook to access audio player functionality
export const useAudioPlayer = () => {
  const audioRef = useRef(null);

  const playAudio = () => {
    if (audioRef.current) {
      audioRef.current.volume = 0.8;
      audioRef.current.play().catch((e) => {
        console.log("Autoplay prevented, user interaction needed", e);
      });
    }
  };

  return { audioRef, playAudio };
}; 