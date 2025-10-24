<script lang="ts">
	import { MapLibre, Marker, Popup } from 'svelte-maplibre-gl';
	import type { PageData } from './$types';
	import LocationCard from '$lib/LocationCard.svelte';
	import { CircleQuestionMark } from '@lucide/svelte';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();

	let center = $state({ lng: 4.45, lat: 51.1 });
	let zoom = $state(7);

	// Track selected categories (initialize with all categories from server)
	let selectedCategories = $state<string[]>([...data.categories]);

	// Track selected location ID (only one can be selected at a time)
	let selectedLocationId = $state<string | null>(null);

	$inspect(data.categories);

	// Calculate category count display
	const categoryCountDisplay = $derived(
		selectedCategories.length === 0 || selectedCategories.length === data.categories.length
			? 'alle'
			: selectedCategories.length.toString()
	);

	// Filter locations based on selected categories
	const filteredLocations = $derived(
		// If no categories selected, show all locations
		selectedCategories.length === 0
			? data.locations
			: data.locations.filter(
					(loc: (typeof data.locations)[0]) =>
						selectedCategories.includes(loc.category) || loc.category === ''
				)
	);

	function toggleCategory(category: string) {
		if (selectedCategories.includes(category)) {
			selectedCategories = selectedCategories.filter((c) => c !== category);
		} else {
			selectedCategories = [...selectedCategories, category];
		}
	}

	function getLocationId(location: (typeof data.locations)[0]): string {
		return `${location.latitude},${location.longitude}`;
	}

	function selectLocation(location: (typeof data.locations)[0]) {
		const locationId = getLocationId(location);
		// If clicking the same location, deselect it
		if (selectedLocationId === locationId) {
			selectedLocationId = null;
		} else {
			// Select the new location (this automatically deselects any previous selection)
			selectedLocationId = locationId;
		}
	}

	function zoomToLocation(location: (typeof data.locations)[0]) {
		center = { lng: location.longitude, lat: location.latitude };
		zoom = 14;
		// Also select the location when zooming to it
		selectLocation(location);
	}
</script>

<div class="grid h-screen grid-cols-1 md:grid-cols-[280px_1fr]">
	<!-- Sidebar -->
	<aside class="bg-surface-50-900 hidden h-screen flex-col border-r border-surface-500/30 md:flex">
		<div class="border-b border-surface-500/30 p-4">
			<div class="grid grid-cols-[1fr_auto] items-center">
				<img src="/logo-deelkaart.png" alt="Wij Delen Deelkaart" class="h-10 object-contain" />
				<CircleQuestionMark class="text-surface-600-300" size={20} />
			</div>
		</div>

		<!-- Category Filters -->
		<div class="border-b border-surface-500/30 p-4 text-primary-500">
			<span class="mb-3 font-light text-primary-500"> Wij delen om te </span>
			<span class="flex inline flex-wrap">
				{#each data.categories as category, i (category)}
					<button
						class="-mx-1 me-0.5 inline rounded px-1 text-sm font-bold transition-all hover:bg-primary-500/20 {selectedCategories.includes(
							category
						)
							? 'bg-primary-500/10 opacity-100'
							: 'opacity-50'}"
						onclick={() => toggleCategory(category)}
					>
						{category}
					</button>
				{/each}
			</span>
		</div>

		<!-- Scrollable locations list -->
		<div class="flex-1 overflow-y-auto">
			<p class="text-surface-600-300 px-4 text-sm">
				{filteredLocations.length} locaties
			</p>
			<ul class="divide-y divide-surface-600">
				{#each filteredLocations as location (location.name + location.latitude + location.longitude)}
					<li class="p-2">
						<button
							class="hover:bg-surface-100-800 w-full cursor-pointer rounded p-2 text-left transition-colors {selectedLocationId ===
							getLocationId(location)
								? 'border border-primary-500/30 bg-primary-500/10'
								: ''}"
							onclick={() => zoomToLocation(location)}
						>
							<LocationCard {location} />
						</button>
					</li>
				{/each}
			</ul>
		</div>
	</aside>

	<!-- Main content -->
	<main class="h-full overflow-hidden">
		<MapLibre
			style="https://tiles.openfreemap.org/styles/liberty"
			class="h-full w-full"
			{zoom}
			{center}
			maxPitch={85}
			attributionControl={{ compact: true }}
		>
			{#each filteredLocations as location: Location (location.name + location.latitude + location.longitude)}
				<Marker lnglat={{ lng: location.longitude, lat: location.latitude }}>
					{#snippet content()}
						<div
							class="cursor-pointer text-center leading-none transition-all duration-200 {selectedLocationId ===
							getLocationId(location)
								? 'scale-125 drop-shadow-lg'
								: 'hover:scale-110'}"
							onclick={() => selectLocation(location)}
						>
							<div class="text-3xl">{location.emoji}</div>
						</div>
					{/snippet}
					<Popup class="text-black" closeButton={true} closeOnClick={false}>
						<div class="min-w-[200px]">
							<h3 class="mb-2 text-lg font-bold">{location.name}</h3>
							{#if location.description}
								<p class="mb-2 text-sm">{location.description}</p>
							{/if}
							{#if location.address}
								<p class="text-sm">{location.address}</p>
							{/if}
							{#if location.postalCode || location.city}
								<p class="text-sm">{location.postalCode} {location.city}</p>
							{/if}
							{#if location.email}
								<p class="mt-2 text-sm">
									<a href="mailto:{location.email}" class="text-blue-600 hover:underline"
										>{location.email}</a
									>
								</p>
							{/if}
							{#if location.url}
								<p class="text-sm">
									<a
										href={location.url}
										target="_blank"
										rel="noopener noreferrer"
										class="text-blue-600 hover:underline">Website</a
									>
								</p>
							{/if}
						</div>
					</Popup>
				</Marker>
			{/each}
		</MapLibre>
	</main>
</div>
