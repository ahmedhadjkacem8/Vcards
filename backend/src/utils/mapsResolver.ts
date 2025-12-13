import { URL } from 'url';
import { incrementMapsResolveFailures } from './metrics';

/**
 * Try to resolve a Google Maps (or similar) link to coordinates.
 * Follows redirects (server-side) and tries several patterns on the final URL.
 * Returns { lat, lon, finalUrl } or null if no coords found.
 */
export async function resolveMapsLink(link: string): Promise<{ lat: number; lon: number; finalUrl: string } | null> {
  try {
    // ensure protocol
    let url = link;
    if (!/^https?:\/\//i.test(url)) url = 'https://' + url;

    // Use global fetch (Node 18+). Follow redirects to get final URL.
    const resp = await fetch(url, { redirect: 'follow' });
    const finalUrl = resp.url || url;

    // Patterns to extract coordinates
    const patterns: RegExp[] = [
      /@(-?\d+\.\d+),(-?\d+\.\d+)/, // @lat,lon
      /[?&]q=(-?\d+\.\d+),(-?\d+\.\d+)/, // ?q=lat,lon
      /!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/, // !3dLAT!4dLON
      /(-?\d+\.\d+),\s*(-?\d+\.\d+)/, // generic pair
    ];

    for (const p of patterns) {
      const m = finalUrl.match(p);
      if (m) {
        const lat = parseFloat(m[1]);
        const lon = parseFloat(m[2]);
        if (!Number.isNaN(lat) && !Number.isNaN(lon)) {
          return { lat, lon, finalUrl };
        }
      }
    }

    // As a last resort, try to parse HTML body for latitude/longitude metadata
    try {
      const text = await resp.text();
      // look for "center=lat,lon" or similar
      const m2 = text.match(/center=\s*(-?\d+\.\d+),(-?\d+\.\d+)/) || text.match(/"latitude"\s*:\s*"?(-?\d+\.\d+)"?[ ,\n]+"longitude"\s*:\s*"?(-?\d+\.\d+)"?/i);
      if (m2) {
        const lat = parseFloat(m2[1]);
        const lon = parseFloat(m2[2]);
        if (!Number.isNaN(lat) && !Number.isNaN(lon)) {
          return { lat, lon, finalUrl };
        }
      }
    } catch (e) {
      // ignore
    }

    // no coords found
    incrementMapsResolveFailures();
    console.warn('[mapsResolver] coords not found for link:', link, 'finalUrl:', finalUrl);
    return null;
  } catch (err) {
    incrementMapsResolveFailures();
    console.error('resolveMapsLink error', err);
    return null;
  }
}

export default resolveMapsLink;
