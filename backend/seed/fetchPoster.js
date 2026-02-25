import fetch from "node-fetch";
import { RAWG_KEY } from "../src/config.js";

export async function fetchPoster(gameName) {
  if (!RAWG_KEY) return null;
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
    const best = results.find(r => normalize(r.name) === target)
      || results.find(r => normalize(r.name).startsWith(target))
      || results.find(r => target.split(/\s+/).every(tok => normalize(r.name).includes(tok)))
      || results[0];

    let posterSource = best;
    if (best?.slug) {
      try {
        const slugUrl = `https://api.rawg.io/api/games/${encodeURIComponent(best.slug)}?key=${RAWG_KEY}`;
        const slugRes = await fetch(slugUrl);
        if (slugRes.ok) {
          const slugData = await slugRes.json();
          if (slugData) posterSource = slugData;
        }
      } catch (e) {
        console.warn('RAWG slug fetch failed for', best.slug, e.message || e);
      }
    }

    return (posterSource && posterSource.background_image) ? posterSource.background_image : null;
  } catch (e) {
    console.warn('fetchPoster error for', gameName, e.message || e);
  }
  return null;
}
