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
    } catch {
      // Autoplay with sound is commonly blocked until the user clicks.
    }
  };

  useEffect(() => {
    void playAudio();
  }, []);

  return (
    <>
      <audio
        ref={audioRef}
        src="/audio/purple-bob.mp3"
        loop
        onPause={() => setIsPlaying(false)}
        onPlay={() => setIsPlaying(true)}
        preload="auto"
      />
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
