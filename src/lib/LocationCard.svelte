<script lang="ts">
	interface Location {
		name: string;
		description?: string;
		city?: string;
		category?: string;
		emoji?: string;
		latitude: number;
		longitude: number;
	}

	interface Props {
		location: Location;
	}

	let { location }: Props = $props();
</script>

<div class="flex items-start justify-between">
	<div class="min-w-0 flex-1">
		<h3 class="truncate text-sm font-medium">{location.name}</h3>
		{#if location.description}
			<p class="text-surface-600-300 mt-1 line-clamp-2 text-xs">
				{location.description}
			</p>
		{/if}
		{#if location.city}
			<p class="text-surface-500-400 mt-1 text-xs">{location.city}</p>
		{/if}
	</div>
	{#if location.category}
		<span
			class="bg-surface-200-700 text-surface-600-300 ml-2 flex shrink-0 items-center gap-1 rounded-full px-2 py-1 text-xs"
		>
			{#if location.emoji}
				<span class="text-sm">{location.emoji}</span>
			{/if}
			<span>{location.category}</span>
		</span>
	{/if}
</div>
