# DaFuqBro.com

Unhinged quizzes and generators that expose who you really are.

## Stack

- **Framework**: React Router v7 (formerly Remix)
- **Runtime**: Cloudflare Workers
- **Styling**: Tailwind CSS v4
- **Build**: Vite + Cloudflare Vite Plugin
- **AI**: OpenAI GPT-4o-mini (via server-side actions)

## Project Structure

```
├── app/
│   ├── components/    # Shared UI (Header, Footer, ShareButtons, etc.)
│   ├── data/          # Tool definitions, constants
│   ├── routes/        # Page routes (home, shitcoin, roast, etc.)
│   ├── routes.ts      # Route config
│   ├── root.tsx       # Root layout (GA, fonts, meta)
│   ├── entry.server.tsx
│   └── app.css        # Global styles + Tailwind
├── workers/
│   └── app.ts         # Cloudflare Worker entry point
├── wrangler.jsonc     # Worker config
├── vite.config.ts     # Vite + Cloudflare + Tailwind
└── react-router.config.ts
```

## Deployment (Cloudflare Workers Builds)

1. Push repo to GitHub
2. In Cloudflare Dashboard → Workers & Pages → Import Git repository
3. Build settings:
   - Build command: `npm run build`
   - Deploy command: `npx wrangler deploy`
4. Add custom domain: `dafuqbro.com`

## Adding New Tools

1. Create `app/routes/newtool.tsx`
2. Add route in `app/routes.ts`
3. Add tool entry in `app/data/tools.ts`
4. Push to GitHub → auto-deploys
