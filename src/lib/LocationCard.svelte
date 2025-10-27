<script lang="ts">
	interface Location {
		name: string;
		city?: string;
		category?: string;
		emoji?: string;
	}

	interface Props {
		location: Location;
	}

	let { location }: Props = $props();
</script>

<div class="text-surface-600-300 flex items-start justify-between">
	<div class="flex-1">
		<h3 class="truncate text-sm font-medium">{location.name}</h3>
		{#if location.category}
			<span class="flex shrink-0 items-center gap-1 rounded-full text-xs">
				{#if location.emoji}
					<span class="text-sm">{location.emoji}</span>
				{/if}
				<span>{location.category}</span>
			</span>
		{/if}

		{#if location.city}
			<p class="text-surface-500-400 mt-1 text-xs">{location.city}</p>
		{/if}
	</div>
</div>
