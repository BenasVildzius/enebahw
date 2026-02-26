// fetchPrice (CommonJS) - uses global fetch (Node 18+)
// Returns: { price: number, currency: 'USD', stores: [ {storeID, storeName, price, retailPrice, savings, dealID, url} ] }

let CACHED_STORES_MAP = null;

async function fetchStoresMap() {
  if (CACHED_STORES_MAP) return CACHED_STORES_MAP;
  try {
    const res = await fetch('https://www.cheapshark.com/api/1.0/stores');
    if (!res.ok) return {};
    const stores = await res.json();
    const map = {};
    for (const s of stores) {
      map[String(s.storeID)] = { name: s.storeName, isActive: s.isActive, images: s.images };
    }
    CACHED_STORES_MAP = map;
    return map;
  } catch (e) {
    console.warn('fetchStoresMap failed', e && e.message ? e.message : e);
    return {};
  }
}

const WHITELIST_KEYS = ['steam','ubisoft','ubi','epic','gog','playstation','psn','xbox','microsoft','ms'];

function isWhitelistedStore(name) {
  if (!name) return false;
  const s = String(name).toLowerCase();
  return WHITELIST_KEYS.some(k => s.includes(k));
}

async function fetchPrice(gameName) {
  try {
    const searchUrl = `https://www.cheapshark.com/api/1.0/games?title=${encodeURIComponent(gameName)}`;
    const res = await fetch(searchUrl);
    if (!res.ok) return { price: 0, currency: 'USD', stores: [] };
    const data = await res.json();

    if (!Array.isArray(data) || data.length === 0) return { price: 0, currency: 'USD', stores: [] };

    const first = data.find(d => String(d.external).toLowerCase() === String(gameName).toLowerCase()) || data[0];
    const gameID = first.gameID || first.id || null;

    const storesMap = await fetchStoresMap();

    let enriched = [];
    if (gameID) {
      try {
        const detailsUrl = `https://www.cheapshark.com/api/1.0/games?id=${encodeURIComponent(gameID)}`;
        const dres = await fetch(detailsUrl);
        if (dres.ok) {
          const details = await dres.json();
          const deals = details.deals || [];
          const stores = deals.map(deal => {
            const sid = String(deal.storeID);
            return {
              storeID: sid,
              storeName: (storesMap[sid] && storesMap[sid].name) || deal.storeName || null,
              price: deal.price != null ? parseFloat(deal.price) : null,
              retailPrice: deal.retailPrice != null ? parseFloat(deal.retailPrice) : null,
              savings: deal.savings != null ? parseFloat(deal.savings) : null,
              dealID: deal.dealID || null,
              url: deal.url || null
            };
          });

          enriched = stores.filter(s => isWhitelistedStore(s.storeName) && s.price != null);
        }
      } catch (e) {
        console.warn('fetchPrice details fetch failed for', gameName, e && e.message ? e.message : e);
      }
    }

    const cheapest = (enriched && enriched.length > 0)
      ? enriched.reduce((acc, cur) => (cur.price != null && (acc == null || cur.price < acc) ? cur.price : acc), null)
      : (first.cheapest ? parseFloat(first.cheapest) : null);

    return { price: cheapest != null ? cheapest : 0, currency: 'USD', stores: enriched };
  } catch (e) {
    console.warn('fetchPrice error for', gameName, e && e.message ? e.message : e);
    return { price: 0, currency: 'USD', stores: [] };
  }
}

export { fetchPrice };
