<script lang="ts">
	import type { Feature } from 'geojson';
	import type { Point } from 'geojson';
	import { MapPin, Globe, Navigation } from '@lucide/svelte';
	import CategoryIcon from './CategoryIcon.svelte';
	import type { OnlineOnlyEntry } from '../routes/+page.server';
	import { formatUrl, extractDomain, getLogoDevUrl } from './utils';

	type Entry = Feature<Point> | OnlineOnlyEntry;

	interface Props {
		entry: Entry;
	}

	let { entry }: Props = $props();

	let imageLoaded = $state(false);
	let logoError = $state(false);
	let darkMode = $state(false);

	// Detect dark mode preference
	$effect(() => {
		if (typeof window === 'undefined') return;

		const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
		darkMode = mediaQuery.matches;

		const handleChange = (e: MediaQueryListEvent) => {
			darkMode = e.matches;
		};

		mediaQuery.addEventListener('change', handleChange);
		return () => mediaQuery.removeEventListener('change', handleChange);
	});

	function isFeature(e: Entry): e is Feature<Point> {
		return (e as Feature<Point>).geometry !== undefined;
	}

	function navigateToLocation() {
		if (!isFeature(entry)) return;
		const [lng, lat] = entry.geometry.coordinates;
		const locationName = encodeURIComponent(entry.properties?.name || '');
		const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&destination_place_id=${locationName}`;
		window.open(googleMapsUrl, '_blank');
	}

	// Get the URL for the current entry
	function getEntryUrl(): string | null {
		return isFeature(entry) ? entry.properties?.url || null : entry.url || null;
	}

	// Get logo URL from logo.dev
	function getLogoUrl(): string | null {
		const url = getEntryUrl();
		if (!url) return null;

		const domain = extractDomain(url);
		if (!domain) return null;

		// Try WebP first, fallback to PNG if needed
		const logoUrl = getLogoDevUrl(domain, {
			theme: darkMode ? 'dark' : 'light',
			format: 'webp',
			size: 256
		});

		return logoUrl;
	}

	const logoUrl = $derived(getLogoUrl());
	const shouldShowLogo = $derived(logoUrl && !logoError);

	// Reset image loaded state when entry changes
	$effect(() => {
		void entry;
		imageLoaded = false;
		logoError = false;
	});

	// Reset error state when dark mode changes (logo URL will update automatically)
	$effect(() => {
		void darkMode;
		void logoUrl;
		// Reset error state when logo URL changes (e.g., due to theme change)
		logoError = false;
		imageLoaded = false;
	});
</script>

<div
	class="w-72 shrink-0 overflow-hidden rounded-container bg-surface-50-950 text-surface-800-200 shadow-lg sm:w-80 md:w-96"
>
	<!-- Image Section -->
	<div class="relative h-24 w-full overflow-hidden">
		{#key isFeature(entry) ? entry.id : entry.id}
			<!-- Placeholder - always shown as fallback -->
			<div
				class="flex h-full w-full items-center justify-center bg-linear-to-br from-primary-50 to-primary-100 transition-opacity {shouldShowLogo &&
				imageLoaded
					? 'opacity-0'
					: 'opacity-100'}"
			>
				<CategoryIcon
					iconName={(isFeature(entry) ? entry.properties?.icon : entry.icon) || 'MapPin'}
					size={48}
					class="text-primary-500"
				/>
			</div>

			<!-- Logo overlay - only shown when loaded successfully -->
			{#if shouldShowLogo}
				<div
					class="absolute inset-0 transition-opacity {imageLoaded ? 'opacity-100' : 'opacity-0'}"
				>
					<!-- Blurred background logo -->
					<picture>
						<source srcset={logoUrl} type="image/webp" />
						<img
							src={logoUrl}
							alt=""
							class="absolute inset-0 h-full w-full scale-110 object-cover blur-xl"
							loading="lazy"
							onload={() => {
								imageLoaded = true;
							}}
							onerror={() => {
								logoError = true;
								imageLoaded = false;
							}}
						/>
					</picture>
					<!-- Main logo -->
					<picture>
						<source srcset={logoUrl} type="image/webp" />
						<img
							src={logoUrl}
							alt={(isFeature(entry) ? entry.properties?.name : entry.name) || 'Location logo'}
							class="relative z-10 h-full w-full object-contain p-2"
							loading="lazy"
							onerror={() => {
								logoError = true;
								imageLoaded = false;
							}}
						/>
					</picture>
				</div>
			{/if}
		{/key}
	</div>

	<!-- Content Section -->
	<div class="p-5">
		<!-- Business Name -->
		<h4 class="h4 text-surface-900-100">
			{(isFeature(entry) ? entry.properties?.name : entry.name) || 'Unknown Location'}
		</h4>

		<!-- Category -->
		{#if isFeature(entry) ? entry.properties?.category : entry.category}
			<div class="flex items-center gap-2">
				{#if isFeature(entry) ? entry.properties?.icon : entry.icon}
					<CategoryIcon
						iconName={(isFeature(entry) ? entry.properties?.icon : entry.icon) || 'MapPin'}
						size={16}
						class="shrink-0 text-primary-500"
					/>
				{/if}
				<span class="text-s capitalize">
					{isFeature(entry) ? entry.properties!.category : entry.category}
				</span>
			</div>
		{/if}

		<!-- Description -->
		{#if isFeature(entry) ? entry.properties?.description : entry.description}
			<p class="mb-4 text-sm">
				{isFeature(entry) ? entry.properties!.description : entry.description}
			</p>
		{/if}

		<!-- Action Button -->
		<div class="mb-4">
			{#if isFeature(entry)}
				<button
					onclick={navigateToLocation}
					class="btn flex w-full items-center justify-center gap-2 preset-tonal-primary"
				>
					<Navigation size={16} />
					Navigeer
				</button>
			{/if}
		</div>

		<!-- Contact Details -->
		<div class="space-y-2">
			{#if isFeature(entry) && entry.properties?.address}
				<div class="flex items-start gap-2 text-sm">
					<MapPin size={16} class="mt-0.5 shrink-0" />
					<span>
						{entry.properties.address}
						{#if entry.properties.postalCode}
							, {entry.properties.postalCode}
						{/if}
						{#if entry.properties.city}
							{entry.properties.city}
						{/if}
					</span>
				</div>
			{/if}

			{#if isFeature(entry) ? entry.properties?.url : entry.url}
				<div class="flex items-center gap-2 text-sm">
					<Globe size={16} class="shrink-0" />
					<!-- eslint-disable svelte/no-navigation-without-resolve -->
					<a
						href={isFeature(entry) ? entry.properties!.url : entry.url}
						target="_blank"
						rel="external"
						class="text-primary-500 underline hover:text-primary-600"
					>
						{formatUrl(isFeature(entry) ? entry.properties!.url : entry.url)}
					</a>
					<!-- eslint-enable svelte/no-navigation-without-resolve -->
				</div>
			{/if}
		</div>
	</div>
</div>
