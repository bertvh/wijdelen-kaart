/**
 * Formats a URL for display by removing protocol and paths.
 * Returns just the domain (e.g., "www.example.com" or "example.com")
 */
export function formatUrl(url: string): string {
	// Ensure URL has a protocol for the URL constructor
	const urlWithProtocol =
		url.startsWith('http://') || url.startsWith('https://') ? url : `https://${url}`;

	try {
		const urlObj = new URL(urlWithProtocol);
		return urlObj.hostname;
	} catch (error) {
		console.error('Failed to parse URL:', url, error);
		return url;
	}
}

/**
 * Extracts the domain from a URL for logo.dev API usage.
 * Removes www. prefix for cleaner logo lookup.
 * @param url - The website URL
 * @returns The domain without www. prefix (e.g., "example.com")
 */
export function extractDomain(url: string): string | null {
	if (!url || url.trim() === '') return null;

	try {
		const urlWithProtocol =
			url.startsWith('http://') || url.startsWith('https://') ? url : `https://${url}`;
		const urlObj = new URL(urlWithProtocol);
		let domain = urlObj.hostname;

		// Remove www. prefix if present
		if (domain.startsWith('www.')) {
			domain = domain.substring(4);
		}

		return domain;
	} catch (error) {
		console.error('Failed to extract domain from URL:', url, error);
		return null;
	}
}

/**
 * Generates a logo.dev API URL for a given domain.
 * @param domain - The domain name (e.g., "example.com")
 * @param options - Configuration options
 * @returns The logo.dev URL or null if domain is invalid
 */
export function getLogoDevUrl(
	domain: string | null,
	options: {
		theme?: 'light' | 'dark';
		format?: 'webp' | 'png' | 'jpg';
		size?: number;
		apiKey?: string;
	} = {}
): string | null {
	if (!domain) return null;

	const {
		theme = 'light',
		format = 'webp',
		size = 256,
		apiKey = import.meta.env.VITE_LOGO_DEV_API_KEY || import.meta.env.PUBLIC_LOGO_DEV_API_KEY
	} = options;

	if (!apiKey) {
		console.warn(
			'Logo.dev API key not found. Please set VITE_LOGO_DEV_API_KEY or PUBLIC_LOGO_DEV_API_KEY'
		);
		return null;
	}

	const baseUrl = 'https://img.logo.dev';
	const params = new URLSearchParams({
		token: apiKey,
		format,
		theme,
		size: size.toString()
	});

	return `${baseUrl}/${domain}?${params.toString()}`;
}

/**
 * Checks if the user prefers dark mode.
 * @returns true if dark mode is preferred, false otherwise
 */
export function isDarkMode(): boolean {
	if (typeof window === 'undefined') return false;
	return window.matchMedia('(prefers-color-scheme: dark)').matches;
}
