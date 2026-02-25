import fetch from "node-fetch";
import { RAWG_KEY } from "../src/config.js";

export async function fetchDetails(gameName, slug = null) {
  if (!RAWG_KEY) return null;

  // 1. If slug is provided, fetch canonical RAWG game directly
  if (slug) {
    try {
      console.log("Using RAWG slug override for", gameName, "→", slug);
      const slugUrl = `https://api.rawg.io/api/games/${encodeURIComponent(slug)}?key=${RAWG_KEY}`;
      const slugRes = await fetch(slugUrl);
      if (slugRes.ok) {
        const g = await slugRes.json();
        return {
          poster: g.background_image || null,
          description: g.description_raw || g.description || null,
          release_year: g.released ? g.released.split('-')[0] : null,
          platforms: g.platforms?.map((p) => p.platform.name).join(';') || null,
          slug: g.slug || null,
          rating: g.rating || null,
        };
      } else {
        console.warn("Slug fetch not ok for", slug, slugRes.status);
      }
    } catch (e) {
      console.warn("Slug fetch failed for", slug, e.message || e);
    }
  }

  // 2. Fallback to search
  try {
    const url = `https://api.rawg.io/api/games?key=${RAWG_KEY}&search=${encodeURIComponent(gameName)}`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    const results = data.results || [];
    if (results.length === 0) return null;

    const normalize = (s) => (s || '')
      .toLowerCase()
      .replace(/\s*\(.*?\)\s*/g, ' ')
      .replace(/[^a-z0-9]+/g, ' ')
      .trim();

    const target = normalize(gameName);
    const best =
      results.find(r => normalize(r.name) === target) ||
      results.find(r => normalize(r.name).startsWith(target)) ||
      results.find(r => target.split(/\s+/).every(tok => normalize(r.name).includes(tok))) ||
      results[0];

    let source = best;

    if (best.slug) {
      try {
        const slugUrl = `https://api.rawg.io/api/games/${encodeURIComponent(best.slug)}?key=${RAWG_KEY}`;
        const slugRes = await fetch(slugUrl);
        if (slugRes.ok) {
          const slugData = await slugRes.json();
          if (slugData) {
            console.log('Fetched RAWG slug data for', best.slug, '->', slugData.name || slugData.slug);
            source = slugData;
          }
        } else {
          console.warn('RAWG slug endpoint returned', slugRes.status, 'for', best.slug);
        }
      } catch (e) {
        console.warn('RAWG slug fetch failed for', best.slug, e.message || e);
      }
    }

    return {
      poster: source.background_image || null,
      description: source.description_raw || source.description || null,
      release_year: source.released ? source.released.split('-')[0] : null,
      platforms: source.platforms?.map((p) => p.platform.name).join(';') || null,
      slug: source.slug || null,
      rating: source.rating || null,
    };
  } catch (e) {
    console.warn('fetchDetails error for', gameName, e.message || e);
    return null;
  }
}
