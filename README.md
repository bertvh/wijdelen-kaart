# wijdelen-kaart

An interactive map application for discovering shared rental locations and services. This Svelte-based web application provides users with a visual interface to explore and filter rental opportunities in their area.

🌐 **Live Application**: [kaart.wijdelen.be](https://kaart.wijdelen.be)

## Logo.dev Integration

This application uses [logo.dev](https://logo.dev) to automatically fetch and display company logos based on their domain names. The logos support:

- **Automatic dark/light mode** - Logos adapt to user's system preference
- **Multiple formats** - WebP format for optimal performance
- **Lazy loading** - Logos load only when needed
- **Fallback support** - Category icons are shown when logos aren't available

### Setup

To enable logo.dev integration, you need to set your publishable API key as an environment variable:

1. Copy `.env.example` to `.env.local`:

   ```bash
   cp .env.example .env.local
   ```

2. Add your API key to `.env.local`:

   ```bash
   VITE_LOGO_DEV_API_KEY=your_publishable_api_key_here
   ```

   Or if using SvelteKit's public environment variables:

   ```bash
   PUBLIC_LOGO_DEV_API_KEY=your_publishable_api_key_here
   ```

3. Get your API key from [logo.dev](https://logo.dev) dashboard.

**Note:** `.env.local` is gitignored and is for local development only. The `.env.example` file serves as a template.

## Vercel Analytics & Speed Insights

This application uses [Vercel Analytics](https://vercel.com/analytics) and [Vercel Speed Insights](https://vercel.com/speed-insights) to track user interactions and monitor performance metrics.

- **Analytics** runs in development mode locally and production mode when deployed
- **Speed Insights** automatically tracks Core Web Vitals and performance metrics

## Developing

Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```sh
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

To create a production version of your app:

```sh
npm run build
```

You can preview the production build with `npm run preview`.

> To deploy your app, you may need to install an [adapter](https://svelte.dev/docs/kit/adapters) for your target environment.
