import fetch from "node-fetch";

export async function fetchPrice(gameName) {
  try {
    const url = `https://www.cheapshark.com/api/1.0/games?title=${encodeURIComponent(
      gameName
    )}`;
    const res = await fetch(url);
    if (!res.ok) return { price: 0, currency: "EUR" };
    const data = await res.json();

    if (Array.isArray(data) && data.length > 0) {
      return {
        price: parseFloat(data[0].cheapest) || 0,
        currency: "EUR",
      };
    }
  } catch (e) {
    console.warn('fetchPrice error for', gameName, e.message || e);
  }
  return { price: 0, currency: "EUR" };
}
