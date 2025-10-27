<script lang="ts">
	import { MapLibre, GeoJSONSource, CircleLayer, SymbolLayer, Marker } from 'svelte-maplibre-gl';
	import type { PageData } from './$types';
	import type { Map, MapMouseEvent, GeoJSONSource as MapLibreGeoJSONSource } from 'maplibre-gl';
	import LocationCard from '$lib/LocationCard.svelte';
	import CategoryFilter from '$lib/CategoryFilter.svelte';
	import LocationPopup from '$lib/LocationPopup.svelte';
	import { CircleQuestionMark, X } from '@lucide/svelte';
	import { type Point, type Feature } from 'geojson';
	import { fade } from 'svelte/transition';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();

	let map: Map | undefined = $state();
	let source: MapLibreGeoJSONSource | undefined = $state();

	let center = $state({ lng: 4.45, lat: 51.1 });
	let zoom = $state(7);
	let cursor: string | undefined = $state();

	// Track selected categories (will be managed by CategoryFilter component)
	let selectedCategories = $state<string[]>([]);

	// Track selected feature for floating card
	let selectedFeature = $state<Feature<Point> | null>(null);

	// Track animation state
	let showLocationsList = $state(false);

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

	function zoomToLocation(feature: Feature<Point>) {
		const [lng, lat] = feature.geometry.coordinates;
		map!.easeTo({
			center: [lng, lat]
		});
		// Also select the location when zooming to it
		selectedFeature = feature;
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
				}, 0);
			}
		}
	}
</script>

<div class="relative h-screen">
	<div class="grid h-full grid-cols-1 md:grid-cols-[280px_1fr]">
		<!-- Sidebar -->
		<aside class="z-10 hidden h-screen flex-col bg-surface-50-950 shadow-lg md:flex">
			<div class="border-b border-surface-500/30 p-4">
				<div class="grid grid-cols-[1fr_auto] items-center">
					<img src="/logo-deelkaart.png" alt="Wij Delen Deelkaart" class="h-10 object-contain" />
					<CircleQuestionMark class="text-primary-500" size={20} />
				</div>
			</div>

			<!-- Category Filters -->
			<CategoryFilter
				categories={data.categories}
				onSelectedCategoriesChange={(categories) => {
					selectedCategories = categories;
				}}
				onAnimationComplete={() => {
					showLocationsList = true;
				}}
			/>

			<!-- Scrollable locations list -->
			{#if showLocationsList}
				<div class="flex-1 overflow-y-auto" in:fade={{ duration: 500 }}>
					<p class="px-4 text-xs font-extralight text-surface-800-200">
						{filteredGeoJson.features.length} locaties
					</p>
					<ul class="divide-y divide-surface-600">
						{#each filteredGeoJson.features as feature (feature.id)}
							<li
								role="button"
								tabindex="0"
								class="w-full cursor-pointer p-4 text-left transition-colors hover:bg-primary-50-950/50 {selectedFeature?.id ===
								feature.id
									? 'bg-primary-50-950 hover:bg-primary-50-950/80'
									: ''}"
								onclick={() => zoomToLocation(feature)}
								onkeydown={(e) => {
									if (e.key === 'Enter' || e.key === ' ') {
										e.preventDefault();
										zoomToLocation(feature);
									}
								}}
							>
								<LocationCard
									location={{
										name: feature.properties?.name || '',
										city: feature.properties?.city || '',
										category: feature.properties?.category || '',
										emoji: feature.properties?.emoji || ''
									}}
								/>
							</li>
						{/each}
					</ul>
				</div>
			{/if}
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
				autoloadGlobalCss={false}
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

				<!-- Selected location marker -->
				{#if selectedFeature}
					<Marker
						color="#df016c"
						lnglat={[
							selectedFeature.geometry.coordinates[0],
							selectedFeature.geometry.coordinates[1]
						]}
					>
						<div
							class="flex h-8 w-8 items-center justify-center rounded-full bg-primary-500 text-white shadow-lg"
						></div>
					</Marker>
				{/if}
			</MapLibre>
		</main>
	</div>

	<!-- Floating Card -->
	{#if selectedFeature}
		<div class="absolute top-4 left-[296px] z-50 hidden md:block">
			<div class="relative">
				<button
					onclick={() => {
						selectedFeature = null;
					}}
					class="absolute -top-2 -right-2 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-surface-900 text-white shadow-lg hover:bg-surface-700"
					aria-label="Close location details"
				>
					<X class="pointer-events-none text-surface-500" size={16} />
				</button>
				<LocationPopup feature={selectedFeature} />
			</div>
		</div>
	{/if}
</div>

<style lang="postcss">
	@reference "tailwindcss";
</style>
