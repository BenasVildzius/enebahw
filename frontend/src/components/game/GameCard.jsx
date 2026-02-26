import React from 'react';
import './GameCard.css';
import heartIcon from '../../assets/icons/heart.svg';

export default function GameCard({ game }) {
  const poster = game.poster || game.cover_url || '';

  const baseNumPrice = parseFloat(game.price) || 0;
  const basePriceDisplay = `€${baseNumPrice.toFixed(2)}`;
  const cashbackAmount = baseNumPrice * 0.1;
  const cashbackDisplay = `Cashback: €${cashbackAmount.toFixed(2)}`;

  const likes = game.likes || 0;

  const platforms = Array.isArray(game.platforms)
    ? game.platforms
    : (game.platform ? [game.platform] : []);

  const foundPC = platforms.find(p => /pc|windows/i.test(String(p)));
  const platformLabel = foundPC ? 'PC' : (platforms.length ? String(platforms[0]).toUpperCase() : 'PC');

  const regionRaw = game.activation_region || game.region || 'GLOBAL';
  const region = String(regionRaw).toUpperCase();

  const STORE_MAP = [
    { keys: ['ea'], file: 'ea.svg', label: 'EA' },
    { keys: ['steam'], file: 'steam.svg', label: 'Steam' },
    { keys: ['ubisoft', 'ubi'], file: 'ubi.svg', label: 'Ubisoft', invert: true },
    { keys: ['epic', 'epic games'], file: 'epic.svg', label: 'Epic Games' },
    { keys: ['gog'], file: 'gog.svg', label: 'GOG' },
    { keys: ['playstation', 'psn'], file: 'psn.svg', label: 'PlayStation', invert: true },
    { keys: ['xbox'], file: 'xbox.svg', label: 'Xbox', invert: true },
    { keys: ['microsoft', 'ms'], file: 'ms.svg', label: 'Microsoft', invert: true },
  ];

  const findStoreEntry = (name) => {
    if (!name) return null;
    const s = String(name).toLowerCase();
    return STORE_MAP.find(m =>
      m.keys.some(k => {
        const key = String(k).toLowerCase();
        if (key.length <= 2) return new RegExp(`\\b${key}\\b`).test(s);
        return s.includes(key);
      })
    ) || null;
  };

  const candidates = [];

  if (Array.isArray(game.deals)) {
    for (const s of game.deals) {
      const nm = s?.shopName || s?.storeName || s?.name || s?.store?.name;
      const entry = findStoreEntry(nm);
      const pricePresent =
        s?.price != null ||
        s?.cheapest != null ||
        s?.salePrice != null ||
        s?.dealPrice != null ||
        s?.retailPrice != null ||
        s?.price_new != null;

      if (entry && pricePresent) candidates.push({ raw: s, entry, name: nm });
    }
  }

  if (candidates.length === 0 && Array.isArray(game.stores)) {
    for (const s of game.stores) {
      const nm = s?.store?.name || s?.name || s?.shopName || s?.storeName;
      const entry = findStoreEntry(nm);
      const pricePresent =
        s?.price != null ||
        s?.cheapest != null ||
        s?.salePrice != null ||
        s?.dealPrice != null ||
        s?.dealID ||
        s?.retailPrice != null ||
        s?.price_new != null;

      if (entry && pricePresent) candidates.push({ raw: s, entry, name: nm });
    }
  }

  let chosen = null;
  if (candidates.length > 0) {
    chosen = candidates[Math.floor(Math.random() * candidates.length)];
  }

  const storeName = chosen?.entry?.label || '';
  const storeIconPath = chosen
    ? `/src/assets/icons/${chosen.entry.file}`
    : `/src/assets/icons/store.svg`;

  const NON_INVERT_FILES = ['psn.svg', 'xbox.svg', 'steam.svg'];
  const storeIconInvert = chosen ? !NON_INVERT_FILES.includes(chosen.entry.file) : true;

  const storePriceRaw =
    chosen?.raw?.price ||
    chosen?.raw?.cheapest ||
    chosen?.raw?.salePrice ||
    chosen?.raw?.dealPrice ||
    null;

  const storePrice = storePriceRaw != null ? parseFloat(storePriceRaw) : null;
  const displayPrice = storePrice != null ? `€${storePrice.toFixed(2)}` : basePriceDisplay;
  const displayCashback =
    storePrice != null
      ? `Cashback: €${(storePrice * 0.1).toFixed(2)}`
      : cashbackDisplay;

  return (
  <article className="game-card">
    <div className="poster-wrapper">
      {poster ? (
        <img src={poster} alt={game.name} className="poster-img" />
      ) : (
        <div className="poster-placeholder" />
      )}
    </div>

    <div className="details-block">
      <div className="store-bar">
        <img
          src={storeIconPath}
          alt={storeName || 'store'}
          className={storeIconInvert ? 'invert-icon' : ''}
        />
        {storeName && <div className="store-name">{storeName}</div>}
      </div>
      <h3 className="game-title">{game.name} {storeName ? `${storeName} ` : ''}Key ({platformLabel}) {region}</h3>
      <div className="region-sub">{platformLabel} • {region}</div>

      <div className="price-row">
        <div className="price-wrap">
          <div className="price">{displayPrice}</div>
          <div className="cashback-small">{displayCashback}</div>
        </div>

        <div className="likes">
          <img src={heartIcon} alt="likes" className="icon-white heart-icon" />
          {likes}
        </div>
      </div>
    </div>
  </article>
  );
}