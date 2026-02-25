// frontend/src/App.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000';

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
          {games.map(g => (
            <li key={g.id}>
              <img src={g.cover_url} alt={g.name} width="80" />
              <div>
                <h3>{g.name}</h3>
                <p>{g.platform} • {g.release_year}</p>
                <p>{g.description}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
