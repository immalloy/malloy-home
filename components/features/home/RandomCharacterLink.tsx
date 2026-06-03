"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { randomCharacters } from "../../../lib/home/random-characters";

export function RandomCharacterLink() {
  const [pick, setPick] = useState<(typeof randomCharacters)[number] | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPick(randomCharacters[Math.floor(Math.random() * randomCharacters.length)]);
  }, []);

  const onError = useCallback(() => setFailed(true), []);

  if (!pick || failed) return null;

  return (
    <a className="home-random-link" href={pick.href} rel="noreferrer" target="_blank">
      <span className="home-random-tooltip">{pick.label}</span>
      <Image
        alt=""
        className="home-random-image"
        height={pick.height}
        loading="eager"
        onError={onError}
        sizes="(max-width: 640px) 42vw, 20vw"
        src={pick.src}
        style={{ height: "auto", width: "auto" }}
        width={pick.width}
      />
    </a>
  );
}
