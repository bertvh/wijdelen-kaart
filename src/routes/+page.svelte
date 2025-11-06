<script lang="ts">
	import {
		MapLibre,
		GeoJSONSource,
		CircleLayer,
		SymbolLayer,
		Marker,
		ScaleControl,
		GeolocateControl,
		NavigationControl
	} from 'svelte-maplibre-gl';
	import type { PageData } from './$types';
	import type { Map, MapMouseEvent, GeoJSONSource as MapLibreGeoJSONSource } from 'maplibre-gl';
	import CategoryFilter from '$lib/CategoryFilter.svelte';
	import LocationPopup from '$lib/LocationDetailCard.svelte';
	import ResultsCount from '$lib/ResultsCount.svelte';
	import LocationsList from '$lib/LocationsList.svelte';
	import PageHeader from '$lib/PageHeader.svelte';
	import DetailHeader from '$lib/DetailHeader.svelte';
	import { X, ChevronUp, ChevronDown } from '@lucide/svelte';
	import type { Point, Feature } from 'geojson';
	import { fade, slide } from 'svelte/transition';
	import type { OnlineOnlyEntry } from './+page.server';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();

	let map: Map | undefined = $state();
	let source: MapLibreGeoJSONSource | undefined = $state();

	// Bounding box for the map (minLng, minLat, maxLng, maxLat)
	const bounds: [[number, number], [number, number]] = [
		[0.439453, 49.353756],
		[8.745117, 52.062623]
	];

	let center = $state({ lng: 4.237976, lat: 51.011463 });
	let zoom = $state(7);
	let cursor: string | undefined = $state();

	// Fit map to bounds when it loads
	$effect(() => {
		if (map) {
			map.fitBounds(bounds, { padding: 200 });
		}
	});

	// Track selected categories (will be managed by CategoryFilter component)
	let selectedCategories = $state<string[]>([]);

	// Track selected entry for floating card (feature or online entry)
	let selectedEntry = $state<Feature<Point> | OnlineOnlyEntry | null>(null);

	// Track animation state
	let showLocationsList = $state(false);

	// Mobile bottom sheet state
	type MobileSheetState = 'collapsed' | 'expanded' | 'detail';
	let mobileSheetState = $state<MobileSheetState>('collapsed');

	// Filter GeoJSON features based on selected categories (for sidebar list)
	// Entries with empty categories always show regardless of filter
	const filteredGeoJson = $derived({
		type: 'FeatureCollection' as const,
		features:
			selectedCategories.length === 0
				? data.geojson.features
				: data.geojson.features.filter((feature) => {
						const category = feature.properties?.category || '';
						// Always show entries with empty categories
						if (category === '') return true;
						return selectedCategories.includes(category);
					})
	});

	// Filter online-only entries based on selected categories
	// Entries with empty categories always show regardless of filter
	const filteredOnlineOnly = $derived(
		selectedCategories.length === 0
			? data.onlineOnlyEntries
			: data.onlineOnlyEntries.filter((e) => {
					const category = e.category || '';
					// Always show entries with empty categories
					if (category === '') return true;
					return selectedCategories.includes(category);
				})
	);

	// Navigation functions
	function zoomToLocation(feature: Feature<Point>) {
		const [lng, lat] = feature.geometry.coordinates;
		map!.easeTo({
			center: [lng, lat]
		});
		// Also select the location when zooming to it
		selectedEntry = feature;
	}

	function zoomToLocationMobile(feature: Feature<Point>) {
		const [lng, lat] = feature.geometry.coordinates;
		map!.easeTo({
			center: [lng, lat]
		});
		showMobileDetail(feature);
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

	// Consolidated selection logic - detects mobile vs desktop
	function selectLocation(e: MapMouseEvent) {
		const features = map!.queryRenderedFeatures(e.point);
		if (features.length > 0) {
			const feature = features[0];
			// Only select if it's not a cluster (doesn't have point_count)
			if (!feature.properties?.point_count) {
				const isMobile = window.innerWidth < 768;
				setTimeout(() => {
					if (isMobile) {
						showMobileDetail(feature as Feature<Point>);
					} else {
						selectedEntry = feature as Feature<Point>;
					}
				}, 0);
			}
		}
	}

	// Selection handlers for list items
	function handleFeatureClick(feature: Feature<Point>, isMobile: boolean) {
		if (isMobile) {
			zoomToLocationMobile(feature);
		} else {
			zoomToLocation(feature);
		}
	}

	function handleOnlineEntryClick(entry: OnlineOnlyEntry, isMobile: boolean) {
		if (isMobile) {
			showMobileDetail(entry);
		} else {
			selectedEntry = entry;
		}
	}

	// Mobile-specific functions
	function expandMobileSheet() {
		mobileSheetState = 'expanded';
	}

	function collapseMobileSheet() {
		mobileSheetState = 'collapsed';
		selectedEntry = null;
	}

	function showMobileDetail(entry: Feature<Point> | OnlineOnlyEntry) {
		selectedEntry = entry;
		mobileSheetState = 'detail';
	}

	// Prevent body scroll when bottom sheet is expanded
	$effect(() => {
		if (mobileSheetState === 'expanded' || mobileSheetState === 'detail') {
			document.body.style.overflow = 'hidden';
		} else {
			document.body.style.overflow = '';
		}
		return () => {
			document.body.style.overflow = '';
		};
	});
</script>

<div class="relative h-dvh font-light">
	<!-- Mobile Header -->
	<PageHeader variant="mobile" />

	<!-- Desktop version -->
	<div class="grid h-full grid-cols-1 md:grid-cols-[280px_1fr]">
		<!-- Sidebar -->
		<aside class="z-10 hidden h-full flex-col overflow-auto bg-surface-50-950 shadow-lg md:flex">
			<PageHeader variant="desktop" />

			<!-- Category Filters -->
			<div class="p-4">
				<CategoryFilter
					categories={data.categories}
					onSelectedCategoriesChange={(categories) => {
						selectedCategories = categories;
					}}
					onAnimationComplete={() => {
						showLocationsList = true;
					}}
				/>
			</div>

			<!-- Scrollable locations list -->
			{#if showLocationsList}
				<div class="px-4 py-2 pb-2 shadow-md">
					<ResultsCount
						locationsCount={filteredGeoJson.features.length}
						onlineCount={filteredOnlineOnly.length}
						locationsTargetId="locations-list"
						onlineTargetId="online-list"
						variant="desktop"
					/>
				</div>
				<div class="flex-1 overflow-y-auto" in:fade={{ duration: 500 }}>
					<LocationsList
						features={filteredGeoJson.features}
						onlineEntries={filteredOnlineOnly}
						{selectedEntry}
						onFeatureClick={(feature) => handleFeatureClick(feature, false)}
						onOnlineEntryClick={(entry) => handleOnlineEntryClick(entry, false)}
						locationsListId="locations-list"
						onlineListId="online-list"
					/>
				</div>
			{/if}
		</aside>

		<!-- Main content -->
		<main
			class="h-full overflow-hidden pt-[52px] transition-all duration-300 ease-in-out md:pt-0 {!showLocationsList
				? 'blur'
				: ''}"
		>
			<MapLibre
				style="https://tiles.openfreemap.org/styles/liberty"
				class="h-full w-full"
				{zoom}
				{center}
				{cursor}
				maxPitch={85}
				maxBounds={bounds}
				dragRotate={false}
				rollEnabled={false}
				pitchWithRotate={false}
				touchPitch={false}
				attributionControl={{ compact: true }}
				bind:map
				autoloadGlobalCss={false}
			>
				<ScaleControl />
				<GeolocateControl />
				<NavigationControl />
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
				{#if selectedEntry && 'geometry' in selectedEntry}
					<Marker
						color="#df016c"
						lnglat={[
							(selectedEntry as Feature<Point>).geometry.coordinates[0],
							(selectedEntry as Feature<Point>).geometry.coordinates[1]
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

	<!-- Floating Location Details Card (Desktop only) -->
	{#if selectedEntry}
		<div class="absolute top-4 left-[296px] z-50 hidden md:block">
			<div class="relative">
				<button
					onclick={() => {
						selectedEntry = null;
					}}
					class="absolute -top-2 -right-2 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-surface-900 text-white shadow-lg hover:bg-surface-700"
					aria-label="Close location details"
				>
					<X class="pointer-events-none text-surface-500" size={16} />
				</button>
				<div
					class="w-72 shrink-0 overflow-hidden rounded-container bg-surface-50-950 text-surface-800-200 shadow-lg lg:w-96"
				>
					<LocationPopup entry={selectedEntry} />
				</div>
			</div>
		</div>
	{/if}

	<!-- Mobile Bottom Sheet -->
	<div class="fixed right-0 bottom-0 left-0 z-50 md:hidden">
		<!-- Collapsed State -->
		{#if mobileSheetState === 'collapsed'}
			<div
				class="pb-safe bg-surface-50-950 shadow-2xl transition-transform duration-300 ease-out"
				in:slide={{ axis: 'y', duration: 300 }}
			>
				<button
					onclick={expandMobileSheet}
					class="flex w-full items-center justify-between px-4 py-3 text-left active:bg-surface-100-900/50"
					aria-label="Show results"
				>
					<ResultsCount
						locationsCount={filteredGeoJson.features.length}
						onlineCount={filteredOnlineOnly.length}
						locationsTargetId="mobile-locations-list"
						onlineTargetId="mobile-online-list"
					/>
					<ChevronUp size={20} class="text-surface-700-300" />
				</button>
			</div>
		{/if}

		<!-- Expanded State (Filter + List) -->
		{#if mobileSheetState === 'expanded'}
			<div
				class="pb-safe flex max-h-[85vh] flex-col bg-surface-50-950 shadow-2xl transition-transform duration-300 ease-out"
				in:slide={{ axis: 'y', duration: 300 }}
			>
				<!-- Drag Handle and Header -->
				<div class="flex items-center justify-between border-b border-surface-200-800 px-4 py-1">
					<ResultsCount
						locationsCount={filteredGeoJson.features.length}
						onlineCount={filteredOnlineOnly.length}
						locationsTargetId="mobile-locations-list"
						onlineTargetId="mobile-online-list"
					/>
					<button
						onclick={collapseMobileSheet}
						class="flex h-8 w-8 items-center justify-center rounded-full hover:bg-surface-100-900"
						aria-label="Collapse"
					>
						<ChevronDown size={20} class="text-surface-700-300" />
					</button>
				</div>

				<!-- Scrollable Content -->
				<div class="flex-1 overflow-y-auto overscroll-contain">
					<!-- Category Filter -->
					<div class="mx-4 border-b border-surface-200-800">
						<CategoryFilter
							categories={data.categories}
							onSelectedCategoriesChange={(categories) => {
								selectedCategories = categories;
							}}
							onAnimationComplete={() => {
								showLocationsList = true;
							}}
							animate={false}
						/>
					</div>

					<!-- Results Count -->
					{#if showLocationsList}
						<LocationsList
							features={filteredGeoJson.features}
							onlineEntries={filteredOnlineOnly}
							{selectedEntry}
							onFeatureClick={(feature) => handleFeatureClick(feature, true)}
							onOnlineEntryClick={(entry) => handleOnlineEntryClick(entry, true)}
							locationsListId="mobile-locations-list"
							onlineListId="mobile-online-list"
							showTransition={true}
						/>
					{/if}
				</div>
			</div>
		{/if}

		<!-- Detail State -->
		{#if mobileSheetState === 'detail' && selectedEntry}
			<div
				class="pb-safe flex max-h-[90vh] flex-col bg-surface-50-950 shadow-2xl transition-transform duration-300 ease-out"
				in:slide={{ axis: 'y', duration: 300 }}
			>
				<!-- Image Section at top with close button overlay -->
				<div class="relative">
					<DetailHeader entry={selectedEntry} variant="mobile" />
					<!-- Close button overlay -->
					<button
						onclick={collapseMobileSheet}
						class="absolute top-4 right-4 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-surface-900/80 text-white backdrop-blur-sm hover:bg-surface-900"
						aria-label="Close"
					>
						<X size={20} class="text-surface-50" />
					</button>
				</div>

				<!-- Detail Content (scrolls behind filter) -->
				<div class="flex-1 overflow-y-auto overscroll-contain">
					<LocationPopup entry={selectedEntry} />
				</div>
			</div>
		{/if}
	</div>
</div>
