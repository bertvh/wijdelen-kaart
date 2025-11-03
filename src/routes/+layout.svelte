<script lang="ts">
	import '../app.css';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href="/WijDelen_FavIconWEB.svg" type="image/svg+xml" />
</svelte:head>

{@render children?.()}
