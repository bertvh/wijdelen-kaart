<script lang="ts">
	import '../app.css';
	import { injectAnalytics } from '@vercel/analytics/sveltekit';
	import { injectSpeedInsights } from '@vercel/speed-insights/sveltekit';

	injectAnalytics({ mode: import.meta.env.PROD ? 'production' : 'development' });
	injectSpeedInsights();

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href="/WijDelen_FavIconWEB.svg" type="image/svg+xml" />
</svelte:head>

{@render children?.()}
