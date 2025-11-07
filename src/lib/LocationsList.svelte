<script lang="ts">
	import type { Feature, Point } from 'geojson';
	import LocationCard from './LocationListItem.svelte';
	import { Globe } from '@lucide/svelte';
	import type { OnlineOnlyEntry } from '../routes/+page.server';
	import { fade } from 'svelte/transition';

	interface Props {
		features: Feature<Point>[];
		onlineEntries: OnlineOnlyEntry[];
		selectedEntry: Feature<Point> | OnlineOnlyEntry | null;
		onFeatureClick: (feature: Feature<Point>) => void;
		onOnlineEntryClick: (entry: OnlineOnlyEntry) => void;
		locationsListId: string;
		onlineListId: string;
		showTransition?: boolean;
	}

	let {
		features,
		onlineEntries,
		selectedEntry,
		onFeatureClick,
		onOnlineEntryClick,
		locationsListId,
		onlineListId,
		showTransition = false
	}: Props = $props();

	const hoverClass = 'hover:bg-primary-50-950/50 active:bg-primary-50-950/50';
	const selectedHoverClass = 'bg-primary-50-950 hover:bg-primary-50-950/80';

	function isFeatureSelected(feature: Feature<Point>): boolean {
		return (
			selectedEntry !== null &&
			'geometry' in selectedEntry &&
			(selectedEntry as Feature<Point>).id === feature.id
		);
	}

	function isOnlineEntrySelected(entry: OnlineOnlyEntry): boolean {
		return selectedEntry !== null && 'id' in selectedEntry && selectedEntry.id === entry.id;
	}

	function handleKeyDown(e: KeyboardEvent, callback: () => void) {
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			callback();
		}
	}
</script>

{#snippet listContent()}
	<ul id={locationsListId} class="divide-y divide-surface-900/10 dark:divide-surface-100/10">
		{#each features as feature (feature.id)}
			<li
				role="button"
				tabindex="0"
				class="w-full min-w-0 cursor-pointer p-4 text-left transition-colors {hoverClass} {isFeatureSelected(
					feature
				)
					? selectedHoverClass
					: ''}"
				onclick={() => onFeatureClick(feature)}
				onkeydown={(e) => handleKeyDown(e, () => onFeatureClick(feature))}
			>
				<LocationCard
					location={{
						name: feature.properties?.name || '',
						address: feature.properties?.address || '',
						postalCode: feature.properties?.postalCode || '',
						city: feature.properties?.city || '',
						category: feature.properties?.category || '',
						icon: feature.properties?.icon || ''
					}}
				/>
			</li>
		{/each}
		<!-- Divider for online-only entries -->
		{#if onlineEntries.length > 0}
			<li id={onlineListId} class="sticky top-0 z-10 bg-primary-100-900/80 p-2">
				<span class="flex text-center text-xs font-bold text-primary-700-300"
					><Globe size={16} />&nbsp;Online diensten</span
				>
			</li>
			{#each onlineEntries as entry (entry.id)}
				<li
					role="button"
					tabindex="0"
					class="w-full min-w-0 cursor-pointer p-4 text-left transition-colors {hoverClass} {isOnlineEntrySelected(
						entry
					)
						? selectedHoverClass
						: ''}"
					onclick={() => onOnlineEntryClick(entry)}
					onkeydown={(e) => handleKeyDown(e, () => onOnlineEntryClick(entry))}
				>
					<LocationCard
						location={{
							name: entry.name,
							city: '',
							category: entry.category,
							icon: entry.icon,
							url: entry.url
						}}
					/>
				</li>
			{/each}
		{/if}
	</ul>
{/snippet}

{#if showTransition}
	<div in:fade={{ duration: 300 }}>
		{@render listContent()}
	</div>
{:else}
	{@render listContent()}
{/if}
