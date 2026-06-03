"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

type GamePlayerProps = {
  embedPath: string;
};

export function GamePlayer({ embedPath }: GamePlayerProps) {
  const shellRef = useRef<HTMLDivElement | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const sync = () => {
      setIsFullscreen(document.fullscreenElement === shellRef.current);
    };

    document.addEventListener("fullscreenchange", sync);
    sync();

    return () => document.removeEventListener("fullscreenchange", sync);
  }, []);

  const toggleFullscreen = async () => {
    if (!shellRef.current) {
      return;
    }

    if (document.fullscreenElement === shellRef.current) {
      await document.exitFullscreen();
      return;
    }

    await shellRef.current.requestFullscreen();
  };

  return (
    <div className="game-player">
      <div className="game-stage" ref={shellRef}>
        <iframe
          allow="autoplay; fullscreen; gamepad"
          allowFullScreen
          className="game-frame"
          referrerPolicy="no-referrer"
          src={embedPath}
          title="Oyachi game"
        />
      </div>
      <button
        className="game-control"
        onClick={toggleFullscreen}
        title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
        type="button"
      >
        <Image
          alt=""
          aria-hidden="true"
          height={20}
          src={isFullscreen ? "/icons/fullscreen-exit.svg" : "/icons/fullscreen-enter.svg"}
          width={20}
        />
      </button>
    </div>
  );
}
