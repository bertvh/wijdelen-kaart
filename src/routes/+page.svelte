<script lang="ts">
	import { MapLibre, GeoJSONSource, CircleLayer, SymbolLayer, Popup } from 'svelte-maplibre-gl';
	import type { PageData } from './$types';
	import type { Map, MapMouseEvent, GeoJSONSource as MapLibreGeoJSONSource } from 'maplibre-gl';
	import LocationCard from '$lib/LocationCard.svelte';
	import { CircleQuestionMark } from '@lucide/svelte';
	import { type Point, type Feature } from 'geojson';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();

	let map: Map | undefined = $state();
	let source: MapLibreGeoJSONSource | undefined = $state();

	let center = $state({ lng: 4.45, lat: 51.1 });
	let zoom = $state(7);
	let cursor: string | undefined = $state();

	// Track selected categories (initialize with all categories from server)
	let selectedCategories = $state<string[]>([...data.categories]);

	// Track selected feature for popup and selection
	let selectedFeature = $state<Feature<Point> | null>(null);
	let popupOpen = $state(false);

	// Filter GeoJSON features based on selected categories (for sidebar list)
	const filteredGeoJson = $derived({
		type: 'FeatureCollection' as const,
		features:
			selectedCategories.length === 0
				? data.geojson.features
				: data.geojson.features.filter(
						(feature) =>
							selectedCategories.includes(feature.properties?.category || '') ||
							feature.properties?.category === ''
					)
	});

	function toggleCategory(category: string) {
		if (selectedCategories.includes(category)) {
			selectedCategories = selectedCategories.filter((c) => c !== category);
		} else {
			selectedCategories = [...selectedCategories, category];
		}
	}

	function zoomToLocation(feature: Feature<Point>) {
		const [lng, lat] = feature.geometry.coordinates;
		map!.easeTo({
			center: [lng, lat]
		});
		// Also select the location when zooming to it
		selectedFeature = feature;
		popupOpen = true;
	}

	async function zoomCluster(e: MapMouseEvent) {
		const features = map!.queryRenderedFeatures(e.point);
		const clusterId = features[0].properties.cluster_id;
		const zoom = await source!.getClusterExpansionZoom(clusterId);
		const center = (features[0].geometry as Point).coordinates;
		map!.easeTo({
			around: [center[0], center[1]],
			zoom
		});
	}

	function selectLocation(e: MapMouseEvent) {
		const features = map!.queryRenderedFeatures(e.point);
		if (features.length > 0) {
			const feature = features[0];
			// Only select if it's not a cluster (doesn't have point_count)
			if (!feature.properties?.point_count) {
				// Use setTimeout to avoid potential state update conflicts
				setTimeout(() => {
					selectedFeature = feature as Feature<Point>;
					popupOpen = true;
				}, 0);
			}
		}
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
			<span class="mb-3 font-light text-primary-500"> Wij delen om te&nbsp;</span>
			<span class="flex inline flex-wrap">
				{#each data.categories as category (category)}
					<button
						class="-mx-1 me-2 rounded px-1 text-sm font-bold transition-all hover:bg-primary-500/20 {selectedCategories.includes(
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
				{filteredGeoJson.features.length} locaties
			</p>
			<ul class="divide-y divide-surface-600">
				{#each filteredGeoJson.features as feature (feature.id)}
					<li class="p-2">
						<button
							class="hover:bg-surface-100-800 w-full cursor-pointer rounded p-2 text-left transition-colors {selectedFeature?.id ===
							feature.id
								? 'border border-primary-500/30 bg-primary-500/10'
								: ''}"
							onclick={() => zoomToLocation(feature)}
						>
							<LocationCard
								location={{
									name: feature.properties?.name || '',
									description: feature.properties?.description || '',
									city: feature.properties?.city || '',
									category: feature.properties?.category || '',
									emoji: feature.properties?.emoji || ''
								}}
							/>
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
			{cursor}
			maxPitch={85}
			attributionControl={{ compact: true }}
			bind:map
		>
			<GeoJSONSource
				id="locations"
				data={filteredGeoJson}
				cluster={true}
				generateId={false}
				bind:source
			>
				<CircleLayer
					filter={['has', 'point_count']}
					paint={{
						'circle-color': '#24ad82',
						'circle-stroke-color': '#FFFFFF',
						'circle-stroke-width': 2,
						'circle-radius': ['+', 12, ['sqrt', ['get', 'point_count']]],
						'circle-opacity': 0.8
					}}
					onmouseenter={() => {
						cursor = 'pointer';
					}}
					onmouseleave={() => (cursor = undefined)}
					onclick={zoomCluster}
				/>
				<SymbolLayer
					filter={['has', 'point_count']}
					layout={{
						'text-field': '{point_count_abbreviated}',
						'text-font': ['Noto Sans Regular'],
						'text-size': 12
					}}
					paint={{
						'text-color': '#FFFFFF'
					}}
				/>
				<CircleLayer
					filter={['!', ['has', 'point_count']]}
					id="locations-layer"
					paint={{
						'circle-color': '#24ad82',
						'circle-radius': 9,
						'circle-stroke-color': '#FFFFFF',
						'circle-stroke-width': 2
					}}
					onmouseenter={() => {
						cursor = 'pointer';
					}}
					onmouseleave={() => (cursor = undefined)}
					onclick={selectLocation}
				/>
				<SymbolLayer
					filter={['!', ['has', 'point_count']]}
					layout={{
						'text-field': ['get', 'name'],
						'text-font': ['Noto Sans Regular'],
						'text-size': 12,
						'text-offset': [1, 0],
						'text-anchor': 'left',
						'text-justify': 'left'
					}}
					paint={{
						'text-color': '#3d3a4b',
						'text-halo-color': '#FFFFFF',
						'text-halo-width': 2
					}}
				/>
			</GeoJSONSource>

			{#if selectedFeature}
				<Popup
					lnglat={[
						selectedFeature.geometry.coordinates[0],
						selectedFeature.geometry.coordinates[1]
					]}
					bind:open={popupOpen}
					closeButton={true}
					closeOnClick={false}
					subpixelPositioning={true}
				>
					<div class="min-w-[200px] p-3 font-sans">
						<div class="mb-2 flex items-center gap-2 border-b border-surface-300 pb-2">
							<span class="text-lg">{selectedFeature.properties?.emoji || '📍'}</span>
							<h3 class="m-0 text-base font-semibold text-surface-900">
								{selectedFeature.properties?.name || 'Unknown Location'}
							</h3>
						</div>
						<div class="flex flex-col gap-1">
							{#if selectedFeature.properties?.description}
								<p class="m-0 text-sm leading-relaxed text-surface-600">
									{selectedFeature.properties.description}
								</p>
							{/if}
							{#if selectedFeature.properties?.city}
								<p class="m-0 flex items-center gap-1 text-xs text-surface-500">
									📍 {selectedFeature.properties.city}
								</p>
							{/if}
							{#if selectedFeature.properties?.category}
								<p class="m-0 flex items-center gap-1 text-xs text-surface-500">
									🏷️ {selectedFeature.properties.category}
								</p>
							{/if}
						</div>
					</div>
				</Popup>
			{/if}
		</MapLibre>
	</main>
</div>
