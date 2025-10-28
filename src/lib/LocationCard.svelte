<script lang="ts">
	import { MapPin, Globe } from '@lucide/svelte';
	import CategoryIcon from './CategoryIcon.svelte';

	interface Location {
		name: string;
		city?: string;
		address?: string;
		postalCode?: string;
		category?: string;
		icon?: string;
		url?: string;
	}

	interface Props {
		location: Location;
	}

	let { location }: Props = $props();

	// Function to clean URL for display (remove protocol)
	function cleanUrl(url: string): string {
		return url.replace(/^https?:\/\//, '');
	}
</script>

<div class="flex items-start justify-between text-surface-800-200">
	<div class="flex-1">
		<h3 class="truncate h3 text-sm font-medium text-surface-900-100">{location.name}</h3>
		{#if location.category}
			<span class="flex shrink-0 items-center gap-1 rounded-full text-xs">
				{#if location.icon}
					<CategoryIcon iconName={location.icon} size={14} class="shrink-0" />
				{/if}
				<span class="capitalize">{location.category}</span>
			</span>
		{/if}

		{#if location.city || location.address || location.postalCode}
			<p class="text-surface-500-400 mt-1 flex items-start gap-1 text-xs">
				<MapPin size="12" class="mt-0.5 shrink-0" />
				<span>
					{#if location.address}
						{location.address}
					{/if}
					{#if location.postalCode}
						{#if location.address},
						{/if}{location.postalCode}
					{/if}
					{#if location.city}
						{#if location.address || location.postalCode}{/if}{location.city}
					{/if}
				</span>
			</p>
		{/if}

		{#if location.url}
			<p class="text-surface-500-400 mt-1 flex items-start gap-1 text-xs">
				<Globe size="12" class="mt-0.5 shrink-0" />
				<!-- eslint-disable svelte/no-navigation-without-resolve -->
				<a href={location.url} target="_blank" rel="noopener noreferrer" class="truncate anchor">
					{cleanUrl(location.url)}
				</a>
				<!-- eslint-enable svelte/no-navigation-without-resolve -->
			</p>
		{/if}
	</div>
</div>
