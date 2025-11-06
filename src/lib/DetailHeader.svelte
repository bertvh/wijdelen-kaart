<script lang="ts">
	import type { Feature } from 'geojson';
	import type { Point } from 'geojson';
	import CategoryIcon from './CategoryIcon.svelte';
	import type { OnlineOnlyEntry } from '../routes/+page.server';
	import { extractDomain, getLogoDevUrl } from './utils';

	type Entry = Feature<Point> | OnlineOnlyEntry;

	interface Props {
		entry: Entry;
		variant?: 'desktop' | 'mobile';
	}

	let { entry, variant = 'desktop' }: Props = $props();

	let imageLoaded = $state(false);
	let logoError = $state(false);
	let darkMode = $state(false);

	const isMobile = variant === 'mobile';
	const iconSize = isMobile ? 64 : 48;
	const displayClass = isMobile ? '' : 'hidden md:block';

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

	function getEntryUrl(): string | null {
		return isFeature(entry) ? entry.properties?.url || null : entry.url || null;
	}

	function getLogoUrl(): string | null {
		const url = getEntryUrl();
		if (!url) return null;

		const domain = extractDomain(url);
		if (!domain) return null;

		return getLogoDevUrl(domain, {
			theme: darkMode ? 'dark' : 'light',
			format: 'webp',
			size: 256
		});
	}

	const logoUrl = $derived(getLogoUrl());
	const shouldShowLogo = $derived(logoUrl && !logoError);

	function getIconName(): string {
		return (isFeature(entry) ? entry.properties?.icon : entry.icon) || 'ShoppingCart';
	}

	function getEntryName(): string {
		return (isFeature(entry) ? entry.properties?.name : entry.name) || 'Location logo';
	}

	function getEntryId(): string | number {
		const id = isFeature(entry) ? entry.id : entry.id;
		// Ensure we always return a valid key - use a fallback if id is undefined
		return id ?? `entry-${Date.now()}`;
	}

	// Reset image loaded state when entry changes
	$effect(() => {
		void entry;
		imageLoaded = false;
		logoError = false;
	});

	// Reset error state when dark mode or logo URL changes
	$effect(() => {
		void darkMode;
		void logoUrl;
		logoError = false;
		imageLoaded = false;
	});
</script>

<div class="relative h-24 w-full overflow-hidden {displayClass}">
	{#key getEntryId()}
		<!-- Placeholder - always shown as fallback -->
		<div
			class="flex h-full w-full items-center justify-center bg-linear-to-br from-primary-50 to-primary-100 transition-opacity {shouldShowLogo &&
			imageLoaded
				? 'opacity-0'
				: 'opacity-100'}"
		>
			<CategoryIcon iconName={getIconName()} size={iconSize} class="text-primary-500" />
		</div>

		<!-- Logo overlay - only shown when loaded successfully -->
		{#if shouldShowLogo}
			<div class="absolute inset-0 transition-opacity {imageLoaded ? 'opacity-100' : 'opacity-0'}">
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
						alt={getEntryName()}
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
