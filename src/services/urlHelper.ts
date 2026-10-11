/**
 * Mahi Crick Pro - Public URL Resolver & Cloud Link Service
 * 
 * Solves Android Studio / Capacitor / WebView localhost issue:
 * When running inside Android Studio APK or Capacitor, window.location.origin is "https://localhost".
 * Sharing "https://localhost/..." fails on other users' phones.
 * This resolver detects local webview environments and automatically uses the public Cloud App URL,
 * or the user's custom Netlify/Web domain configured in Settings.
 */

const STORAGE_CUSTOM_DOMAIN_KEY = 'mahi_crick_custom_domain';

// Default canonical public URL for this application on Google Cloud
export const CANONICAL_CLOUD_URL = 'https://ais-pre-ykn7yqbda2xscq5cjkjz2c-1046201619557.asia-southeast1.run.app';

/**
 * Get user configured custom domain (e.g. https://my-cricket.netlify.app)
 */
export function getCustomPublicDomain(): string | null {
  if (typeof window === 'undefined') return null;
  const saved = localStorage.getItem(STORAGE_CUSTOM_DOMAIN_KEY);
  if (saved && saved.trim().startsWith('http')) {
    return saved.trim().replace(/\/+$/, '');
  }
  return null;
}

/**
 * Set user configured custom domain
 */
export function setCustomPublicDomain(domain: string | null): void {
  if (typeof window === 'undefined') return;
  if (!domain || !domain.trim()) {
    localStorage.removeItem(STORAGE_CUSTOM_DOMAIN_KEY);
  } else {
    let clean = domain.trim();
    if (!clean.startsWith('http://') && !clean.startsWith('https://')) {
      clean = `https://${clean}`;
    }
    localStorage.setItem(STORAGE_CUSTOM_DOMAIN_KEY, clean.replace(/\/+$/, ''));
  }
}

/**
 * Resolves the true public base URL accessible from any phone or browser
 */
export function getPublicBaseUrl(): string {
  // 1. User custom domain (e.g. Netlify) has highest priority if configured
  const custom = getCustomPublicDomain();
  if (custom) {
    return custom;
  }

  // 2. Check if currently running inside a public browser (NOT localhost, NOT Capacitor)
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    const protocol = window.location.protocol;

    const isLocalhost =
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname === '0.0.0.0' ||
      hostname.endsWith('.local') ||
      protocol === 'capacitor:' ||
      protocol === 'file:' ||
      protocol === 'content:';

    // If running on a real public web host (like Cloud Run or public domain), use it
    if (!isLocalhost && window.location.origin && window.location.origin.startsWith('http')) {
      return window.location.origin;
    }
  }

  // 3. Fallback: Android Studio / Capacitor APK running on localhost uses Cloud URL
  return CANONICAL_CLOUD_URL;
}

/**
 * Builds live public share link for a match
 */
export function getMatchShareUrl(matchId: string): string {
  const base = getPublicBaseUrl();
  return `${base}/?liveMatchId=${encodeURIComponent(matchId)}&view=spectator`;
}

/**
 * Builds live public share link for a tournament
 */
export function getTournamentShareUrl(tournamentId: string): string {
  const base = getPublicBaseUrl();
  return `${base}/?tournamentId=${encodeURIComponent(tournamentId)}&view=tournament`;
}
