import Papa from 'papaparse';
import type { FeatureCollection, Feature, Point } from 'geojson';
import csvData from '$lib/data/asadventure.csv?raw';

// Category to emoji mapping
const categoryEmojiMap: Record<string, string> = {
	avonturieren: '🏔️',
	klussen: '🔨',
	sporten: '⚽',
	fietsen: '🚴',
	verbouwen: '🏗️',
	default: '📍'
};

function getCategoryEmoji(category: string): string {
	return categoryEmojiMap[category] || categoryEmojiMap.default;
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

interface Location {
	latitude: number;
	longitude: number;
	name: string;
	description: string;
	address: string;
	postalCode: string;
	city: string;
	email: string;
	url: string;
	image: string;
	category: string;
	emoji: string;
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
			emoji: location.emoji
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
}> {
	// Parse CSV using papaparse
	const parseResult = Papa.parse<LocationCsvRow>(csvData, {
		header: true,
		skipEmptyLines: true,
		transformHeader: (header) => header.trim()
	});

	// Transform and validate the data
	const locations: Location[] = parseResult.data
		.map((row) => {
			const category = row.category?.trim() || '';
			const emoji = getCategoryEmoji(category);
			console.log(
				'Processing row:',
				row.name,
				'category:',
				category,
				'emoji:',
				emoji,
				'raw category:',
				row.category
			);
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
				emoji
			};
		})
		.filter((location) => !isNaN(location.latitude) && !isNaN(location.longitude));

	// Extract unique categories as an array
	const categories = Array.from(
		new Set(locations.map((loc) => loc.category).filter((cat) => cat !== ''))
	);

	console.log('Final categories:', categories);
	console.log(
		'All location categories:',
		locations.map((loc) => loc.category)
	);

	const geojson = locationsToGeoJson(locations);

	return { categories, geojson };
}
