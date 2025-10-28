import Papa from 'papaparse';
import type { FeatureCollection, Feature, Point } from 'geojson';
import locationsCsv from '$lib/data/locations.csv?raw';
import onlineOnlyCsv from '$lib/data/online-only.csv?raw';

// Category to icon mapping (Lucide icon names)
const categoryIconMap: Record<string, string> = {
	avonturieren: 'Mountain',
	klussen: 'Hammer',
	sporten: 'Dumbbell',
	fietsen: 'Bike',
	verbouwen: 'HardHat',
	default: 'MapPin'
};

function getCategoryIcon(category: string): string {
	return categoryIconMap[category] || categoryIconMap.default;
}

interface LocationCsvRow {
	longitude: string;
	latitude: string;
	name: string;
	description: string;
	address: string;
	postalCode: string;
	city: string;
	email: string;
	url: string;
	image: string;
	category: string;
}

interface OnlineOnlyCsvRow {
	name: string;
	description: string;
	email: string;
	url: string;
	image: string;
	category: string;
}

interface BaseEntry {
	name: string;
	description: string;
	email: string;
	url: string;
	image: string;
	category: string;
	icon: string;
}

interface Location extends BaseEntry {
	latitude: number;
	longitude: number;
	address: string;
	postalCode: string;
	city: string;
}

export interface OnlineOnlyEntry extends BaseEntry {
	id: number;
	hasLocation: false;
}

function locationsToGeoJson(locations: Location[]): FeatureCollection<Point> {
	const features: Feature<Point>[] = locations.map((location, index) => ({
		type: 'Feature',
		id: index,
		geometry: {
			type: 'Point',
			coordinates: [location.longitude, location.latitude]
		},
		properties: {
			name: location.name,
			description: location.description,
			address: location.address,
			postalCode: location.postalCode,
			city: location.city,
			email: location.email,
			url: location.url,
			image: location.image,
			category: location.category,
			icon: location.icon
		}
	}));

	return {
		type: 'FeatureCollection',
		features
	};
}

export async function load(): Promise<{
	categories: string[];
	geojson: FeatureCollection<Point>;
	onlineOnlyEntries: OnlineOnlyEntry[];
}> {
	// Parse CSV using papaparse
	const parseLocations = Papa.parse<LocationCsvRow>(locationsCsv, {
		header: true,
		skipEmptyLines: true,
		transformHeader: (header) => header.trim()
	});

	const parseOnlineOnly = Papa.parse<OnlineOnlyCsvRow>(onlineOnlyCsv, {
		header: true,
		skipEmptyLines: true,
		transformHeader: (header) => header.trim()
	});

	// Transform and validate the data
	const locations: Location[] = parseLocations.data
		.map((row) => {
			const category = row.category?.trim() || '';
			const icon = getCategoryIcon(category);

			return {
				latitude: parseFloat(row.latitude?.trim() || '0'),
				longitude: parseFloat(row.longitude?.trim() || '0'),
				name: row.name?.trim() || '',
				description: row.description?.trim() || '',
				address: row.address?.trim() || '',
				postalCode: row.postalCode?.trim() || '',
				city: row.city?.trim() || '',
				email: row.email?.trim() || '',
				url: row.url?.trim() || '',
				image: row.image?.trim() || '',
				category,
				icon
			};
		})
		.filter((location) => !isNaN(location.latitude) && !isNaN(location.longitude));

	// Extract unique categories as an array
	// Parse online-only entries
	const baseIdOffset = locations.length; // features will be indexed 0..n-1
	const onlineOnlyEntries: OnlineOnlyEntry[] = parseOnlineOnly.data
		.map((row, index) => {
			const category = row.category?.trim() || '';
			const icon = getCategoryIcon(category);
			return {
				id: baseIdOffset + index,
				hasLocation: false as const,
				name: row.name?.trim() || '',
				description: row.description?.trim() || '',
				email: row.email?.trim() || '',
				url: row.url?.trim() || '',
				image: row.image?.trim() || '',
				category,
				icon
			};
		})
		.filter((entry) => entry.name !== '' || entry.url !== '');

	// Extract unique categories as an array across both datasets
	const categories = Array.from(
		new Set(
			[
				...locations.map((loc) => loc.category),
				...onlineOnlyEntries.map((entry) => entry.category)
			].filter((cat) => cat !== '')
		)
	);

	const geojson = locationsToGeoJson(locations);

	return { categories, geojson, onlineOnlyEntries };
}
