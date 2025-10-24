<script lang="ts">
	import { MapLibre, Marker, Popup } from 'svelte-maplibre-gl';
	import type { PageData } from './$types';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();

	let center = {lng: 4.5,	lat: 51};
</script>

<MapLibre
	style="https://tiles.openfreemap.org/styles/liberty"
	class="h-[70vh] min-h-[500px]"
	zoom={7}
	{center}
	maxPitch={85}
	attributionControl={false}
>
	{#each data.locations as location: Location (location.name + location.latitude + location.longitude)}
		<Marker lnglat={{ lng: location.longitude, lat: location.latitude }}>
			{#snippet content()}
				<div class="cursor-pointer text-center leading-none">
					<div class="text-3xl">📍</div>
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
