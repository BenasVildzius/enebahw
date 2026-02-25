import React from 'react';
import './GameCard.css';
import heartIcon from '../../assets/icons/heart.svg';

export default function GameCard({ game }) {
  const poster = game.poster || game.cover_url || '';
  const numPrice = parseFloat(game.price) || 0;
  const price = numPrice.toFixed(2);
  const priceDisplay = `€${price}`;

  const cashbackAmount = (numPrice * 0.1) || 0;
  const cashbackDisplay = `Cashback: €${cashbackAmount.toFixed(2)}`;

  const likes = game.likes || 0;
  const platforms = Array.isArray(game.platforms)
    ? game.platforms
    : (game.platform ? [game.platform] : []);

  const foundPC = platforms.find(p => /pc|windows/i.test(String(p)));
  const platformLabel = foundPC ? 'PC' : (platforms.length ? String(platforms[0]).toUpperCase() : 'PC');

  const regionRaw = game.activation_region || game.region || 'GLOBAL';
  const region = String(regionRaw).toUpperCase();

  return (
    <article className="game-card">
      <div className="poster-wrapper">
        {poster ? (
          <img src={poster} alt={game.name} className="poster-img" />
        ) : (
          <div className="poster-placeholder" />
        )}
      </div>

      <div className="card-info">
        <h3 className="game-title">{`${game.name} Steam Key (${platformLabel}) ${region}`}</h3>
        <div className="region-sub">{region}</div>
      </div>

      <div className="card-footer">
        <div className="price-wrap">
          <div className="price">{priceDisplay}</div>
          <div className="cashback-small">Cashback: €{cashbackAmount.toFixed(2)}</div>
        </div>
        <div className="likes"><img src={heartIcon} alt="likes" className="icon icon-white heart-icon" /> {likes}</div>
      </div>
    </article>
  );
}
