<script lang="ts">
	import { MapPin, Globe } from '@lucide/svelte';
	import CategoryIcon from './CategoryIcon.svelte';
	import { formatUrl } from './utils';

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
</script>

<div class="flex min-w-0 items-start justify-between text-surface-800-200">
	<div class="min-w-0 flex-1">
		<h3 class="truncate h3 text-base font-medium text-surface-900-100">{location.name}</h3>
		<p class="flex items-center gap-1 text-sm">
			<CategoryIcon iconName={location.icon || 'ShoppingCart'} size={14} />
			<span class="capitalize">{location.category || 'Allerlei'}</span>
		</p>

		{#if location.city || location.address || location.postalCode}
			<p class="mt-1 flex items-center gap-1 text-sm">
				<MapPin size="14" />
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
			<p class="mt-1 flex items-center gap-1 text-sm">
				<Globe size="14" />
				<!-- eslint-disable svelte/no-navigation-without-resolve -->
				<a href={location.url} target="_blank" rel="noopener noreferrer" class="truncate anchor">
					{formatUrl(location.url)}
				</a>
				<!-- eslint-enable svelte/no-navigation-without-resolve -->
			</p>
		{/if}
	</div>
</div>
