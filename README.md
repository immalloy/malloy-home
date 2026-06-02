# Malloy Site

A tiny Next.js site for Vercel.

## Local Development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Assets

- Background audio lives at `public/audio/purple-bob.mp3`.
- Browsers may block autoplay with sound, so the centered `:)` also acts as the play button.

## Deploying to Vercel

Push this repository to GitHub, import it at Vercel, and keep the detected
Next.js framework preset. Vercel will run `npm run build` automatically.
