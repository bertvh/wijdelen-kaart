<script lang="ts">
	import type { Feature } from 'geojson';
	import type { Point } from 'geojson';
	import { MapPin, Globe, Navigation, PenLine } from '@lucide/svelte';
	import CategoryIcon from './CategoryIcon.svelte';
	import DetailHeader from './DetailHeader.svelte';
	import type { OnlineOnlyEntry } from '../routes/+page.server';
	import { formatUrl } from './utils';

	type Entry = Feature<Point> | OnlineOnlyEntry;

	interface Props {
		entry: Entry;
	}

	let { entry }: Props = $props();

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

	function getSuggestChangeMailtoLink(): string {
		const name = isFeature(entry) ? entry.properties?.name : entry.name;
		const address = isFeature(entry) ? entry.properties?.address : null;
		const postalCode = isFeature(entry) ? entry.properties?.postalCode : null;
		const city = isFeature(entry) ? entry.properties?.city : null;
		const coordinates = isFeature(entry) ? entry.geometry.coordinates : null;

		let body = `Naam: ${name || 'Onbekend'}\n`;

		if (coordinates) {
			const [lng, lat] = coordinates;
			body += `Coördinaten: ${lat}, ${lng}\n`;
		}

		if (address) {
			let fullAddress = address;
			if (postalCode) fullAddress += `, ${postalCode}`;
			if (city) fullAddress += ` ${city}`;
			body += `Adres: ${fullAddress}`;
		}

		const subject = encodeURIComponent('Aanpassing kaart');
		const bodyEncoded = encodeURIComponent(body);

		return `mailto:kaart@wijdelen.be?subject=${subject}&body=${bodyEncoded}`;
	}
</script>

<div class="text-surface-800-200">
	<!-- Image Section (hidden on mobile) -->
	<DetailHeader {entry} variant="desktop" />

	<!-- Content Section -->
	<div class="p-5">
		<!-- Business Name -->
		<h4 class="h4 text-surface-900-100">
			{(isFeature(entry) ? entry.properties?.name : entry.name) || 'Unknown Location'}
		</h4>

		<!-- Category -->
		<div class="flex items-center gap-2">
			<CategoryIcon
				iconName={(isFeature(entry) ? entry.properties?.icon : entry.icon) || 'ShoppingCart'}
				size={16}
				class="shrink-0 text-primary-500"
			/>
			<span class="text-s capitalize">
				{(isFeature(entry) ? entry.properties?.category : entry.category) || 'Allerlei'}
			</span>
		</div>

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

			<!-- Suggest Change Button -->
			<div class="mt-5 flex items-center gap-2 text-xs">
				<!-- eslint-disable svelte/no-navigation-without-resolve -->
				<a
					href={getSuggestChangeMailtoLink()}
					class="flex items-center anchor text-surface-600 hover:text-surface-600"
				>
					<PenLine size={12} class="mr-2 shrink-0 stroke-surface-600" />
					suggereer een aanpassing
				</a>
				<!-- eslint-enable svelte/no-navigation-without-resolve -->
			</div>
		</div>
	</div>
</div>
