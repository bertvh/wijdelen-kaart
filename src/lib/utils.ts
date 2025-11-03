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
