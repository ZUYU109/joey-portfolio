# Joey Tan Chun Yee — portfolio

One-page React site for job applications.

## Photos

Put files in `public/`:

- `portrait.jpg` — your photo
- `shot-1.jpg` — app home
- `shot-2.jpg` — job list
- `shot-3.jpg` — map
- `shot-4.jpg` — another screen

If a file is missing, the page shows an empty frame instead.

## Run locally

```bash
npm install
npm run dev
```

## GitHub Pages

```bash
npm run build
```

Publish the `dist` folder with GitHub Pages. `vite.config.js` already uses a relative `base`, so assets work on a project site such as `https://<username>.github.io/joey-portfolio/`.
