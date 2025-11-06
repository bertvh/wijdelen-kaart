<script lang="ts">
	import InfoDialog from './InfoDialog.svelte';

	interface Props {
		variant?: 'mobile' | 'desktop';
	}

	let { variant = 'desktop' }: Props = $props();

	const isMobile = variant === 'mobile';
</script>

{#if isMobile}
	<header
		class="pt-safe fixed top-0 right-0 left-0 z-40 flex items-center justify-between bg-surface-50-950 px-4 py-3 shadow-md md:hidden"
	>
		<img src="/logo-deelkaart.png" alt="Wij Delen Deelkaart" class="h-8 object-contain" />
		<InfoDialog />
	</header>
{:else}
	<div class="p-4 pb-2">
		<div class="grid grid-cols-[1fr_auto] items-center">
			<img src="/logo-deelkaart.png" alt="Wij Delen Deelkaart" class="h-10 object-contain" />
			<InfoDialog />
		</div>
	</div>
{/if}
