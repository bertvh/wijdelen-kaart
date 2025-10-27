<script lang="ts">
	import type { Feature } from 'geojson';
	import type { Point } from 'geojson';
	import { MapPin, Globe, Navigation } from '@lucide/svelte';

	interface Props {
		feature: Feature<Point>;
	}

	let { feature }: Props = $props();

	function navigateToLocation() {
		const [lng, lat] = feature.geometry.coordinates;
		const locationName = encodeURIComponent(feature.properties?.name || '');
		const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&destination_place_id=${locationName}`;
		window.open(googleMapsUrl, '_blank');
	}
</script>

<div class="w-full max-w-sm overflow-hidden rounded-container bg-surface-50-950 shadow-lg">
	<!-- Image Section -->
	<div class="relative h-24 w-full overflow-hidden">
		{#if feature.properties?.image}
			<!-- Blurred background image -->
			<img
				src={feature.properties.image}
				alt=""
				class="absolute inset-0 h-full w-full scale-110 object-cover blur-xl"
			/>
			<!-- Main image -->
			<img
				src={feature.properties.image}
				alt={feature.properties?.name || 'Location image'}
				class="relative z-10 h-full w-full object-contain"
			/>
		{:else}
			<div
				class="flex h-full w-full items-center justify-center bg-linear-to-br from-primary-50 to-primary-100"
			>
				<span class="text-6xl">{feature.properties?.emoji || '📍'}</span>
			</div>
		{/if}
	</div>

	<!-- Content Section -->
	<div class="p-5">
		<!-- Business Name -->
		<h4 class="h4 text-surface-900">
			{feature.properties?.name || 'Unknown Location'}
		</h4>

		<!-- Category -->
		{#if feature.properties?.category}
			<div class="mb-3 flex items-center gap-2">
				<span class="text-sm text-surface-600">
					{feature.properties.category}
				</span>
			</div>
		{/if}

		<!-- Description -->
		{#if feature.properties?.description}
			<p class="mb-4 text-sm leading-relaxed text-surface-600">
				{feature.properties.description}
			</p>
		{/if}

		<!-- Action Button -->
		<div class="mb-4">
			<button
				onclick={navigateToLocation}
				class="btn flex w-full items-center justify-center gap-2 preset-tonal-primary"
			>
				<Navigation size={16} />
				Navigeer
			</button>
		</div>

		<!-- Contact Details -->
		<div class="space-y-2">
			{#if feature.properties?.address}
				<div class="flex items-start gap-2 text-sm text-surface-600">
					<MapPin size={16} class="mt-0.5 shrink-0" />
					<span>
						{feature.properties.address}
						{#if feature.properties.postalCode}
							, {feature.properties.postalCode}
						{/if}
						{#if feature.properties.city}
							{feature.properties.city}
						{/if}
					</span>
				</div>
			{/if}

			{#if feature.properties?.url}
				<div class="flex items-center gap-2 text-sm">
					<Globe size={16} class="shrink-0 text-surface-600" />
					<!-- eslint-disable svelte/no-navigation-without-resolve -->
					<a
						href={feature.properties.url}
						target="_blank"
						rel="external"
						class="text-primary-500 underline hover:text-primary-600"
					>
						{feature.properties.url.replace(/^https?:\/\//, '')}
					</a>
					<!-- eslint-enable svelte/no-navigation-without-resolve -->
				</div>
			{/if}
		</div>
	</div>
</div>
