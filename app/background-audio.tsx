"use client";

import { useEffect, useRef, useState } from "react";

export function BackgroundAudio() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const playAudio = async () => {
    const audio = audioRef.current;

    if (!audio) {
      return;
    }

    try {
      audio.volume = 0.7;
      await audio.play();
      setIsPlaying(true);
    } catch {
      setIsPlaying(false);
    }
  };

  useEffect(() => {
    void playAudio();
  }, []);

  return (
    <>
      <audio ref={audioRef} src="/audio/purple-bob.mp3" loop preload="auto" />
      <button
        aria-label={
          isPlaying ? "Background audio is playing" : "Play background audio"
        }
        className="smile"
        onClick={playAudio}
        type="button"
      >
        :)
      </button>
    </>
  );
}
