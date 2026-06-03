"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

type Theme = "light" | "dark";

const storageKey = "malloy-theme";

function getInitialTheme(): Theme {
  if (typeof window === "undefined") {
    return "light";
  }

  const savedTheme = window.localStorage.getItem(storageKey);

  if (savedTheme === "light" || savedTheme === "dark") {
    return savedTheme;
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(() => getInitialTheme());

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem(storageKey, theme);
  }, [theme]);

  const nextTheme = theme === "light" ? "dark" : "light";
  const icon =
    theme === "light"
      ? "/icons/theme-moon.svg"
      : "/icons/theme-sun-cloud.svg";
  const label = theme === "light" ? "Switch to dark mode" : "Switch to light mode";

  return (
    <button
      aria-label={label}
      className="theme-toggle"
      key={theme}
      onClick={() => setTheme(nextTheme)}
      type="button"
    >
      <Image alt="" aria-hidden="true" height={20} src={icon} width={20} />
    </button>
  );
}
