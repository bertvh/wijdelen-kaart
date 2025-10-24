import { readFile } from 'fs/promises';
import { join } from 'path';
import Papa from 'papaparse';

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

export async function load(): Promise<{ locations: Location[]; categories: string[] }> {
	const csvPath = join(process.cwd(), 'static', 'data', 'asadventure.csv');
	const csvContent = await readFile(csvPath, 'utf-8');

	// Parse CSV using papaparse
	const parseResult = Papa.parse<LocationCsvRow>(csvContent, {
		header: true,
		skipEmptyLines: true,
		transformHeader: (header) => header.trim()
	});

	// Debug: log the first row to see what fields we have
	if (parseResult.data.length > 0) {
		console.log('First CSV row:', parseResult.data[0]);
		console.log('Available keys:', Object.keys(parseResult.data[0]));
	}

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

	return { locations, categories };
}
