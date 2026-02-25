// frontend/src/App.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE || 'http://localhost:4000';

export default function App() {
  const [q, setQ] = useState('');
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchList = async (search) => {
    setLoading(true);
    try {
      const url = search ? `${API_BASE}/list?search=${encodeURIComponent(search)}` : `${API_BASE}/list`;
      const res = await axios.get(url);
      setGames(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList('');
  }, []);

  const onSearch = (e) => {
    e.preventDefault();
    fetchList(q);
  };

  return (
    <div className="container">
      <form onSubmit={onSearch}>
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search games..." />
        <button type="submit">Search</button>
      </form>

      {loading ? <p>Loading...</p> : (
        <ul>
          {games.map(g => {
            const poster = g.poster || g.cover_url || '';
            const platform = g.platform || g.platforms || '';
            const region = g.activation_region || '';
            const price = typeof g.price === 'number' ? g.price.toFixed(2) : g.price || '0.00';
            const currency = g.base_currency || g.currency || '';
            const cashback = g.cashback_sum != null ? g.cashback_sum : g.cashback || 0;
            const likes = g.likes || 0;
            const description = g.description || g.description_raw || '';

            return (
              <li key={g.id}>
                <img src={poster} alt={g.name} width="80" />
                <div>
                  <h3>{g.name}</h3>
                  <p>{platform} {region ? `• ${region}` : ''}</p>
                  <p>{description}</p>
                  <p>
                    <strong>Price:</strong> {price} {currency} {
                      cashback ? <span>• Cashback: {parseFloat(cashback).toFixed(2)} {currency}</span> : null
                    }
                  </p>
                  <p>Likes: {likes}</p>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
