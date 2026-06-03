"use client";

import { useState } from "react";
import Image from "next/image";
import { discordProfile, socialLinks } from "../../../lib/about/social-links";

export function SocialLinks() {
  const [discordOpen, setDiscordOpen] = useState(false);

  return (
    <>
      <div className="social-grid" aria-label="Social links">
        {socialLinks.map((link) => (
          <a
            className="social-link"
            href={link.href}
            key={link.href}
            rel="noreferrer"
            target="_blank"
          >
            <Image
              alt=""
              aria-hidden="true"
              className="social-icon"
              height={28}
              src={link.icon}
              width={28}
            />
            <span>
              <span className="social-label">{link.label}</span>
              <span className="social-user">{link.user}</span>
            </span>
          </a>
        ))}
        <a
          className="social-link discord-link"
          href={discordProfile.href}
          onClick={() => setDiscordOpen(true)}
          rel="noreferrer"
          target="_blank"
        >
          <Image
            alt=""
            aria-hidden="true"
            className="social-icon"
            height={28}
            src={discordProfile.icon}
            width={28}
          />
          <span>
            <span className="social-label">{discordProfile.label}</span>
            <span className="social-user">{discordProfile.user}</span>
          </span>
        </a>
      </div>

      {discordOpen ? (
        <div
          aria-labelledby="discord-title"
          aria-modal="true"
          className="modal-backdrop"
          role="dialog"
        >
          <div className="discord-modal">
            <h2 id="discord-title">discord</h2>
            <p>
              If the profile link does not work, add me on Discord:
              <strong> {discordProfile.user}</strong>
            </p>
            <button onClick={() => setDiscordOpen(false)} type="button">
              close
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}
