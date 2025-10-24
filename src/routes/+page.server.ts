import { readFile } from 'fs/promises';
import { join } from 'path';
import Papa from 'papaparse';

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
}

export async function load(): Promise<{ locations: Location[] }> {
	const csvPath = join(process.cwd(), 'static', 'data', 'asadventure.csv');
	const csvContent = await readFile(csvPath, 'utf-8');

	// Parse CSV using papaparse
	const parseResult = Papa.parse<LocationCsvRow>(csvContent, {
		header: true,
		skipEmptyLines: true,
		transformHeader: (header) => header.trim()
	});

	// Transform and validate the data
	const locations: Location[] = parseResult.data
		.map((row) => ({
			latitude: parseFloat(row.latitude?.trim() || '0'),
			longitude: parseFloat(row.longitude?.trim() || '0'),
			name: row.name?.trim() || '',
			description: row.description?.trim() || '',
			address: row.address?.trim() || '',
			postalCode: row.postalCode?.trim() || '',
			city: row.city?.trim() || '',
			email: row.email?.trim() || '',
			url: row.url?.trim() || '',
			image: row.image?.trim() || ''
		}))
		.filter((location) => !isNaN(location.latitude) && !isNaN(location.longitude));

	return { locations };
}
